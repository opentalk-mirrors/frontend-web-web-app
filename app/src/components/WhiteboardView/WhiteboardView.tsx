// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  Excalidraw,
  MainMenu,
  exportToSvg,
  getSceneVersion,
  restoreElements,
  reconcileElements,
  CaptureUpdateAction,
  getVisibleSceneBounds,
  zoomToFitBounds,
} from '@excalidraw/excalidraw';
import { RemoteExcalidrawElement } from '@excalidraw/excalidraw/data/reconcile';
import { SceneBounds } from '@excalidraw/excalidraw/element/bounds';
import { ExcalidrawElement, OrderedExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import '@excalidraw/excalidraw/index.css';
import type {
  ExcalidrawImperativeAPI,
  ExcalidrawProps,
  OnUserFollowedPayload,
  SocketId,
} from '@excalidraw/excalidraw/types';
import { Mutable } from '@excalidraw/excalidraw/utility-types';
import { styled } from '@mui/material';
import { keyBy, throttle } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useCreateRoomAssetMutation } from '../../api/rest';
import { Message } from '../../api/types/incoming';
import { VolatileBroadcast } from '../../api/types/incoming/whiteboard';
import { broadcast, broadcastVolatile, storeScene, follow, unfollow } from '../../api/types/outgoing/whiteboard';
import { MeetingNotesIcon, EditIcon } from '../../assets/icons';
import { notifications } from '../../commonComponents';
import { showStorageNearLimitNotification } from '../../commonComponents/Notistack/helper';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { useStorageStatus } from '../../hooks/useStorageStatus';
import { getCurrentConferenceRoom } from '../../modules/WebRTC/ConferenceRoom';
import { useAppStore } from '../../store';
import { selectAccountManagementUrl } from '../../store/slices/configSlice';
import { selectDisplayNameById } from '../../store/slices/participantsSlice';
import { selectRoomId } from '../../store/slices/roomSlice';
import { selectIsModerator, selectOurUuid } from '../../store/slices/userSlice';
import {
  addWhiteboardAsset,
  selectCanUserEdit,
  selectWhiteboardEditRestrictions,
  selectWhiteboardElements,
} from '../../store/slices/whiteboardSlice';
import { ParticipantId } from '../../types';
import StorageTooltip from '../StorageTooltip';
import RestrictionsDialog from './fragments/RestrictionsDialog';

const CURSOR_SYNC_TIMEOUT = 33;
const PDF_PADDING = 64;
const DELETED_ELEMENT_TIMEOUT = 24 * 60 * 60 * 1000; // 1 day
const SYNC_FULL_SCENE_INTERVAL_MS = 20_000;

const WhiteboardWrapper = styled('div')(({ theme }) => ({
  height: '100%',
  width: '100%',
  position: 'relative',

  '& .excalidraw': {
    position: 'absolute',
    inset: 0,
    '--ui-font': theme.typography.fontFamily,
  },

  // CSS-Hack to prevent showing the library button, as excalidraw does not have an option for this.
  // This hack is still fragile, but avoids depending on a localized title attribute.
  '& .sidebar-trigger__label-element': {
    display: 'none',
  },
}));

const WhiteboardView = () => {
  const lastBroadcastedOrReceivedSceneVersion = useRef(-1);
  const broadcastedElementVersions = useRef<Map<string, number>>(new Map());
  const isFollowingRef = useRef(false);
  const store = useAppStore();
  const dispatch = useAppDispatch();
  const [createAsset] = useCreateRoomAssetMutation();
  const { t, i18n } = useTranslation();
  const initialElements = useAppSelector(selectWhiteboardElements);
  const meUUID = useAppSelector(selectOurUuid);
  const isModerator = useAppSelector(selectIsModerator);
  const roomId = useAppSelector(selectRoomId);
  const canUserEditByRestrictions = useAppSelector((state) => selectCanUserEdit(state, meUUID));
  const { enabled: editRestrictionsEnabled, unrestrictedParticipants } = useAppSelector(
    selectWhiteboardEditRestrictions
  );
  const { storageStatus, canUpgrade } = useStorageStatus();
  const accountManagementUrl = useAppSelector(selectAccountManagementUrl);

  const excalidrawAPIRef = useRef<ExcalidrawImperativeAPI | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isRestrictionsDialogOpen, setIsRestrictionsDialogOpen] = useState(false);

  const initialData = useMemo(() => ({ elements: initialElements }), [initialElements]);
  const canUserEdit = isModerator || canUserEditByRestrictions;
  const restrictionsDialogKey = useMemo(
    () => `${isRestrictionsDialogOpen}:${editRestrictionsEnabled}:${[...unrestrictedParticipants].sort().join(',')}`,
    [editRestrictionsEnabled, isRestrictionsDialogOpen, unrestrictedParticipants]
  );

  const renderUploadMenuButton = () => {
    return (
      <StorageTooltip>
        <MainMenu.Item
          icon={<MeetingNotesIcon />}
          onSelect={uploadSceneAsPdf}
          disabled={isUploading || storageStatus === 'full'}
        >
          {t('whiteboard-create-pdf-button')}
        </MainMenu.Item>
      </StorageTooltip>
    );
  };

  const convertSvgToPdfBlob = useCallback(async (svg: ReturnType<typeof exportToSvg>) => {
    await import('svg2pdf.js');
    const { jsPDF } = await import('jspdf');
    const width = parseFloat(svg.getAttribute('width') || '0');
    const height = parseFloat(svg.getAttribute('height') || '0');

    let doc = new jsPDF(width > height ? 'l' : 'p', 'pt', [width + PDF_PADDING * 2, height + PDF_PADDING * 2]);
    doc = await doc.svg(svg, {
      x: PDF_PADDING,
      y: PDF_PADDING,
      width,
      height,
    });
    return doc.output('blob');
  }, []);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const uploadSceneAsPdf = useCallback(async () => {
    const excalidrawAPI = excalidrawAPIRef.current;
    if (!excalidrawAPI || isUploading) {
      return;
    }

    if (roomId === undefined) {
      notifications.error(t('whiteboard-upload-failed'));
      console.error('upload failed: roomId is undefined');
      return;
    }

    try {
      setIsUploading(true);
      if (isModerator) {
        showStorageNearLimitNotification({ storageStatus, canUpgrade, accountManagementUrl });
      }

      const svg: ReturnType<typeof exportToSvg> = await exportToSvg({
        elements: excalidrawAPI.getSceneElements(),
        appState: excalidrawAPI.getAppState(),
      });

      const pdfBlob = await convertSvgToPdfBlob(svg);
      const response = await createAsset({
        roomId,
        fileBlob: pdfBlob,
        fileExtension: 'pdf',
        kind: 'excalidraw_pdf',
      }).unwrap();
      dispatch(addWhiteboardAsset({ asset: { assetId: response.id, filename: response.filename } }));
      notifications.success(t('whiteboard-upload-success'));
    } catch (error) {
      notifications.error(t('whiteboard-upload-failed'));
      console.error('Error exporting to SVG:', error);
    } finally {
      setIsUploading(false);
    }
  }, [
    isUploading,
    roomId,
    t,
    isModerator,
    convertSvgToPdfBlob,
    createAsset,
    dispatch,
    storageStatus,
    canUpgrade,
    accountManagementUrl,
  ]);

  useEffect(() => {
    return () => {
      dispatch(
        broadcastVolatile.action({
          data: {
            pointer: {
              x: 0,
              y: 0,
              tool: 'pointer',
            },
            button: 'up',
            selectedElementIds: {},
          },
        })
      );
    };
  }, [dispatch]);

  // eslint-disable-next-line react-hooks/refs
  const onPointerUpdate = throttle<NonNullable<ExcalidrawProps['onPointerUpdate']>>((payload) => {
    const excalidrawAPI = excalidrawAPIRef.current;
    if (payload.pointersMap.size < 1 || !excalidrawAPI) {
      return;
    }

    dispatch(
      broadcastVolatile.action({
        data: {
          pointer: payload.pointer,
          button: payload.button,
          selectedElementIds: excalidrawAPI.getAppState().selectedElementIds,
        },
      })
    );
  }, CURSOR_SYNC_TIMEOUT);

  const randomInteger = () => Math.floor(Math.random() * 2 ** 31);

  const bumpVersion = useCallback(
    <T extends Mutable<ExcalidrawElement>>(element: T, version?: ExcalidrawElement['version']) => {
      element.version = (version ?? element.version) + 1;
      element.versionNonce = randomInteger();
      element.updated = Date.now();
      return element;
    },
    []
  );

  const bumpElementVersions = useCallback(
    <T extends ExcalidrawElement>(targetElements: T[], localElements: readonly OrderedExcalidrawElement[]) => {
      const localElementsMap = localElements ? keyBy(localElements, 'id') : null;

      return targetElements.map((element) => {
        const localElement = localElementsMap ? localElementsMap[element.id] : null;
        if (
          localElement &&
          (localElement.version > element.version ||
            (localElement.version === element.version && localElement.versionNonce !== element.versionNonce))
        ) {
          return bumpVersion(element, localElement.version);
        }
        return element;
      });
    },
    [bumpVersion]
  );

  const handleReceivedBroadcastMessage = useCallback(
    (remoteElements: readonly RemoteExcalidrawElement[]) => {
      const excalidrawAPI = excalidrawAPIRef.current;
      if (!excalidrawAPI) {
        return;
      }
      const appState = excalidrawAPI.getAppState();
      const existingElements = excalidrawAPI.getSceneElementsIncludingDeleted();
      const restoredRemoteElements = restoreElements(remoteElements, existingElements) as RemoteExcalidrawElement[];
      let reconciledElements = reconcileElements(existingElements, restoredRemoteElements, appState);

      reconciledElements = bumpElementVersions(reconciledElements, existingElements);
      lastBroadcastedOrReceivedSceneVersion.current = getSceneVersion(reconciledElements);

      excalidrawAPI.updateScene({
        elements: reconciledElements,
        captureUpdate: CaptureUpdateAction.NEVER,
      });
    },
    [bumpElementVersions]
  );

  const handleReceivedSceneBoundsUpdates = (participantId: ParticipantId, sceneBounds: SceneBounds) => {
    const excalidrawAPI = excalidrawAPIRef.current;
    if (!excalidrawAPI) {
      return;
    }
    const appState = excalidrawAPI.getAppState();
    if (appState.userToFollow?.socketId !== (participantId as unknown as SocketId)) {
      // receiving remote client's viewport bounds even though we're not subscribed to it!
      return;
    }

    if (appState.userToFollow && appState.followedBy.has(appState.userToFollow.socketId)) {
      // cross-follow case, ignore updates in this case
      return;
    }

    excalidrawAPI.updateScene({
      appState: zoomToFitBounds({
        appState,
        bounds: sceneBounds,
        fitToViewport: true,
        viewportZoomFactor: 1,
      }).appState,
    });
  };

  const handleReceivedVolatileBroadcastMessage = useCallback(
    (participantId: ParticipantId, updates: VolatileBroadcast['data']) => {
      const excalidrawAPI = excalidrawAPIRef.current;
      const isMe = participantId === meUUID;

      if (!excalidrawAPI || isMe) {
        return;
      }

      if ('sceneBounds' in updates) {
        handleReceivedSceneBoundsUpdates(participantId, updates.sceneBounds);
        return;
      }

      const collaborators = excalidrawAPI.getAppState().collaborators;

      if (updates.pointer.x === 0 && updates.pointer.y === 0) {
        // delete pointer when a user unmount the whiteboard
        collaborators.delete(participantId as unknown as SocketId);
      } else {
        const username = selectDisplayNameById(store.getState(), participantId);
        collaborators.set(participantId as unknown as SocketId, {
          ...updates,
          username,
        });
      }

      excalidrawAPI.updateScene({
        collaborators,
      });
    },
    [meUUID, store]
  );

  const handleFollowerGainedLost = (type: 'follower_gained' | 'follower_lost', participantId: ParticipantId) => {
    const excalidrawAPI = excalidrawAPIRef.current;
    if (!excalidrawAPI) {
      return;
    }

    const followedBy = excalidrawAPI.getAppState().followedBy;

    if (type === 'follower_gained') {
      followedBy.add(participantId as unknown as SocketId);
    }
    if (type === 'follower_lost') {
      followedBy.delete(participantId as unknown as SocketId);
    }

    excalidrawAPI.updateScene({
      appState: { followedBy },
    });
  };

  const handleWhiteboardMessages = useCallback(
    (message: Message) => {
      const { namespace, payload } = message;

      if (namespace !== 'excalidraw') {
        return;
      }

      //https://www.jetbrains.com/help/inspectopedia/JSUnreachableSwitchBranches.html
      //noinspection JSUnreachableSwitchBranches
      switch (payload.message) {
        case 'broadcast':
          handleReceivedBroadcastMessage(payload.data.elements as readonly RemoteExcalidrawElement[]);
          break;
        case 'volatile_broadcast':
          handleReceivedVolatileBroadcastMessage(payload.sender, payload.data);
          break;
        case 'followed':
          isFollowingRef.current = true;
          break;
        case 'unfollowed':
          isFollowingRef.current = false;
          break;
        case 'follower_gained':
        case 'follower_lost':
          handleFollowerGainedLost(payload.message, payload.participantId);
          break;
        default:
          break;
      }
    },
    [handleReceivedBroadcastMessage, handleReceivedVolatileBroadcastMessage]
  );

  useEffect(() => {
    const room = getCurrentConferenceRoom();
    if (!room) {
      return;
    }

    room.addEventListener('message', handleWhiteboardMessages);
    return () => {
      room.removeEventListener('message', handleWhiteboardMessages);
    };
  }, [handleWhiteboardMessages]);

  const isSyncableElement = useCallback((element: OrderedExcalidrawElement) => {
    if (element.isDeleted) {
      return element.updated > Date.now() - DELETED_ELEMENT_TIMEOUT;
    }
    return true;
  }, []);

  const broadcastScene = useCallback(
    ({ elements }: { elements: readonly OrderedExcalidrawElement[] }) => {
      for (const element of elements) {
        broadcastedElementVersions.current.set(element.id, element.version);
      }

      dispatch(
        broadcast.action({
          data: {
            elements: elements,
          },
        })
      );
    },
    [dispatch]
  );

  const queueStoreSceneToBackend = throttle(
    // eslint-disable-next-line react-hooks/refs
    () => {
      const excalidrawAPI = excalidrawAPIRef.current;
      if (!excalidrawAPI) {
        return;
      }

      const elements = excalidrawAPI.getSceneElementsIncludingDeleted();
      const appState = excalidrawAPI.getAppState();

      dispatch(
        storeScene.action({
          scene: {
            elements: elements.filter(isSyncableElement),
            appState,
          },
        })
      );
    },
    SYNC_FULL_SCENE_INTERVAL_MS,
    { leading: false }
  );

  // eslint-disable-next-line react-hooks/refs
  const queueBroadcastAllElements = throttle(() => {
    const excalidrawAPI = excalidrawAPIRef.current;
    if (!excalidrawAPI) {
      return;
    }

    const elementsIncludingDeleted = excalidrawAPI.getSceneElementsIncludingDeleted();

    broadcastScene({
      elements: elementsIncludingDeleted.filter(isSyncableElement),
    });

    lastBroadcastedOrReceivedSceneVersion.current = Math.max(
      lastBroadcastedOrReceivedSceneVersion.current,
      getSceneVersion(elementsIncludingDeleted)
    );
  }, SYNC_FULL_SCENE_INTERVAL_MS);

  const handleChange = useCallback<NonNullable<ExcalidrawProps['onChange']>>(
    (elements) => {
      if (getSceneVersion(elements) > lastBroadcastedOrReceivedSceneVersion.current) {
        const syncableElements = elements.reduce((acc, element) => {
          if (
            (!broadcastedElementVersions.current.has(element.id) ||
              element.version > broadcastedElementVersions.current.get(element.id)!) &&
            isSyncableElement(element)
          ) {
            acc.push(element);
          }
          return acc;
        }, [] as OrderedExcalidrawElement[]);

        broadcastScene({ elements: syncableElements });
        lastBroadcastedOrReceivedSceneVersion.current = getSceneVersion(elements);
        queueBroadcastAllElements();
        queueStoreSceneToBackend();
      }
    },
    [broadcastScene, isSyncableElement, queueBroadcastAllElements, queueStoreSceneToBackend]
  );

  const handleOnUserFollow = ({ userToFollow, action }: OnUserFollowedPayload) => {
    switch (action) {
      case 'FOLLOW':
        dispatch(follow.action({ participantId: userToFollow.socketId as unknown as ParticipantId }));
        break;
      case 'UNFOLLOW':
        dispatch(unfollow.action({ participantId: userToFollow.socketId as unknown as ParticipantId }));
        break;
    }
  };

  const broadcastSceneBounds = (sceneBounds: SceneBounds) => {
    dispatch(
      broadcastVolatile.action({
        data: {
          sceneBounds,
        },
      })
    );
  };

  const relayVisibleSceneBounds = () => {
    const excalidrawAPI = excalidrawAPIRef.current;

    if (!excalidrawAPI) {
      return;
    }

    const appState = excalidrawAPI.getAppState();

    if (appState.followedBy.size > 0) {
      broadcastSceneBounds(getVisibleSceneBounds(excalidrawAPI.getAppState()));
    }
  };

  const throttledRelayUserViewportBounds = () => throttle(relayVisibleSceneBounds, CURSOR_SYNC_TIMEOUT)();

  const setExcalidrawAPI = (api: ExcalidrawImperativeAPI) => {
    api.onUserFollow(handleOnUserFollow);
    api.onScrollChange(throttledRelayUserViewportBounds);
    excalidrawAPIRef.current = api;
  };

  const openRestrictionsDialog = useCallback(() => {
    setIsRestrictionsDialogOpen(true);
  }, []);

  const closeRestrictionsDialog = useCallback(() => {
    setIsRestrictionsDialogOpen(false);
  }, []);

  return (
    <WhiteboardWrapper>
      <Excalidraw
        onChange={handleChange}
        onPointerUpdate={onPointerUpdate}
        initialData={initialData}
        langCode={i18n.resolvedLanguage}
        excalidrawAPI={setExcalidrawAPI}
        viewModeEnabled={!canUserEdit}
        UIOptions={{
          tools: {
            image: false,
          },
        }}
      >
        <MainMenu>
          {isModerator && renderUploadMenuButton()}

          {canUserEdit && <MainMenu.DefaultItems.ClearCanvas />}

          {isModerator && (
            <MainMenu.Item icon={<EditIcon />} onSelect={openRestrictionsDialog}>
              {t('whiteboard-edit-restrictions-menu-item')}
            </MainMenu.Item>
          )}

          <MainMenu.Separator />
          <MainMenu.DefaultItems.ToggleTheme />
          <MainMenu.DefaultItems.ChangeCanvasBackground />
        </MainMenu>
      </Excalidraw>
      <RestrictionsDialog
        key={restrictionsDialogKey}
        open={isRestrictionsDialogOpen}
        onClose={closeRestrictionsDialog}
      />
    </WhiteboardWrapper>
  );
};

export default WhiteboardView;
