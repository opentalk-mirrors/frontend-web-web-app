// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  Excalidraw,
  MainMenu,
  exportToSvg,
  hashElementsVersion,
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
  AppState,
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
import StorageFullTooltip from '../StorageFullTooltip';
import RestrictionsDialog from './fragments/RestrictionsDialog';

type ExcalidrawOnPointerUpdateType = ExcalidrawProps['onPointerUpdate'];
type ExcalidrawOnPointerUpdatePayload =
  NonNullable<ExcalidrawOnPointerUpdateType> extends (payload: infer P) => void ? P : never;

const CURSOR_SYNC_TIMEOUT = 33;
const PDF_PADDING = 64;
const DELETED_ELEMENT_TIMEOUT = 24 * 60 * 60 * 1000; // 1 day
const SYNC_SCENE_ELEMENTS_INTERVAL_MS = 50;
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

  // CSS-Hack to hide the footer help button. There is no UIOption to disable it, and the
  // help dialog it opens contains external links to excalidraw.com, GitHub and YouTube
  // that we do not want to surface to users.
  '& .help-icon': {
    display: 'none',
  },
}));

function isSyncableElement(element: OrderedExcalidrawElement) {
  if (element.isDeleted) {
    return element.updated > Date.now() - DELETED_ELEMENT_TIMEOUT;
  }
  return true;
}

function getPersistedSceneAppState(appState: AppState): AppState {
  const { collaborators: _collaborators, followedBy: _followedBy, ...persistedAppState } = appState;
  return persistedAppState as AppState;
}

const WhiteboardView = () => {
  const lastBroadcastedOrReceivedSceneVersion = useRef(-1);
  const broadcastedElementVersions = useRef<Map<string, number>>(new Map());
  const store = useAppStore();
  const dispatch = useAppDispatch();
  const [createAsset] = useCreateRoomAssetMutation();
  const { t, i18n } = useTranslation();
  const initialElements = useAppSelector(selectWhiteboardElements);
  const initialScene = useMemo(() => ({ elements: initialElements }), [initialElements]);
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

  const canUserEdit = isModerator || canUserEditByRestrictions;
  const restrictionsDialogKey = useMemo(
    () => `${isRestrictionsDialogOpen}:${editRestrictionsEnabled}:${[...unrestrictedParticipants].sort().join(',')}`,
    [editRestrictionsEnabled, isRestrictionsDialogOpen, unrestrictedParticipants]
  );

  const lastThrottledPointerUpdate = useRef<ReturnType<typeof throttle> | null>(null);
  const throttledRelayVisibleSceneBounds = useRef<ReturnType<typeof throttle> | null>(null);
  const lastKnownElementsRef = useRef<readonly OrderedExcalidrawElement[]>([]);
  const lastKnownAppStateRef = useRef<AppState | null>(null);

  const renderUploadMenuButton = () => {
    return (
      <StorageFullTooltip>
        <MainMenu.Item
          icon={<MeetingNotesIcon />}
          onSelect={uploadSceneAsPdf}
          disabled={isUploading || storageStatus === 'full'}
        >
          {t('whiteboard-create-pdf-button')}
        </MainMenu.Item>
      </StorageFullTooltip>
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
      lastThrottledPointerUpdate.current?.cancel();
      lastThrottledPointerUpdate.current = null;
      throttledRelayVisibleSceneBounds.current?.cancel();
      throttledRelayVisibleSceneBounds.current = null;

      const room = getCurrentConferenceRoom();
      if (!room) {
        return;
      }
      const elements = lastKnownElementsRef.current;
      const appState = lastKnownAppStateRef.current;
      const syncableElements = elements.filter(isSyncableElement);
      if (syncableElements.length === 0 || !appState) {
        return;
      }
      const persistedAppState = getPersistedSceneAppState(appState);
      dispatch(
        storeScene.action({
          scene: {
            elements: syncableElements,
            appState: persistedAppState,
          },
        })
      );
    };
  }, [dispatch]);

  const throttledOnPointerUpdate = useMemo(() => {
    return throttle(
      (
        pointer: ExcalidrawOnPointerUpdatePayload['pointer'],
        button: ExcalidrawOnPointerUpdatePayload['button'],
        selectedElementIds: AppState['selectedElementIds']
      ) => {
        dispatch(
          broadcastVolatile.action({
            data: {
              pointer,
              button,
              selectedElementIds,
            },
          })
        );
      },
      CURSOR_SYNC_TIMEOUT
    );
  }, [dispatch]);

  const onPointerUpdate: ExcalidrawProps['onPointerUpdate'] = useCallback(
    (payload) => {
      const excalidrawAPI = excalidrawAPIRef.current;
      if (!payload || !excalidrawAPI) {
        return;
      }
      const { pointer, button } = payload;
      const selectedElementIds = excalidrawAPI.getAppState().selectedElementIds;
      lastThrottledPointerUpdate.current = throttledOnPointerUpdate;
      throttledOnPointerUpdate(pointer, button, selectedElementIds);
    },
    [throttledOnPointerUpdate]
  );

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
      lastBroadcastedOrReceivedSceneVersion.current = hashElementsVersion(reconciledElements);

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
        case 'follower_gained':
        case 'follower_lost':
          handleFollowerGainedLost(payload.message, payload.participantId);
          break;
        case 'error':
          console.error(payload.error);
          notifications.error('Whiteboard error: ' + payload.error, { preventDuplicate: true });
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

  const queueStoreSceneToBackend = useMemo(() => {
    return throttle(
      (elementsIncludingDeleted: readonly OrderedExcalidrawElement[], appState: AppState) => {
        const syncableElements = elementsIncludingDeleted.filter(isSyncableElement);
        // guard against persisting an empty scene
        if (syncableElements.length === 0) {
          return;
        }
        dispatch(
          storeScene.action({
            scene: {
              elements: syncableElements,
              appState: getPersistedSceneAppState(appState),
            },
          })
        );
      },
      SYNC_FULL_SCENE_INTERVAL_MS,
      { leading: false, trailing: true }
    );
  }, [dispatch]);

  const broadcastSceneDelta = useMemo(() => {
    return throttle(
      (elements: readonly OrderedExcalidrawElement[], sentVersions: Map<string, number>) => {
        const syncableElements: OrderedExcalidrawElement[] = [];
        for (const element of elements) {
          const lastVersion = sentVersions.get(element.id);
          if (lastVersion === undefined || element.version > lastVersion) {
            syncableElements.push(element);
          }
        }

        if (syncableElements.length === 0) {
          return;
        }

        for (const element of syncableElements) {
          sentVersions.set(element.id, element.version);
        }
        dispatch(broadcast.action({ data: { elements: syncableElements } }));
      },
      SYNC_SCENE_ELEMENTS_INTERVAL_MS,
      { leading: true, trailing: true }
    );
  }, [dispatch]);

  const queueBroadcastAllElements = useMemo(() => {
    return throttle(
      (elementsIncludingDeleted: readonly OrderedExcalidrawElement[], sentVersions: Map<string, number>) => {
        const syncableElements = elementsIncludingDeleted.filter(isSyncableElement);
        if (syncableElements.length === 0) {
          return;
        }

        for (const element of syncableElements) {
          sentVersions.set(element.id, element.version);
        }
        dispatch(broadcast.action({ data: { elements: syncableElements } }));
      },
      SYNC_FULL_SCENE_INTERVAL_MS,
      { leading: false, trailing: true }
    );
  }, [dispatch]);

  const handleChange = useCallback<NonNullable<ExcalidrawProps['onChange']>>(
    (elements, appState) => {
      const elementsVersion = hashElementsVersion(elements);

      if (elementsVersion === lastBroadcastedOrReceivedSceneVersion.current) {
        return;
      }

      lastBroadcastedOrReceivedSceneVersion.current = elementsVersion;
      lastKnownElementsRef.current = elements;
      lastKnownAppStateRef.current = appState;

      broadcastSceneDelta(elements, broadcastedElementVersions.current);
      queueBroadcastAllElements(elements, broadcastedElementVersions.current);
      queueStoreSceneToBackend(elements, appState);
    },
    [broadcastSceneDelta, queueBroadcastAllElements, queueStoreSceneToBackend]
  );

  useEffect(() => {
    return () => {
      broadcastSceneDelta.cancel();
      queueBroadcastAllElements.cancel();
      queueStoreSceneToBackend.cancel();
    };
  }, [broadcastSceneDelta, queueBroadcastAllElements, queueStoreSceneToBackend]);

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

  const setExcalidrawAPI = (api: ExcalidrawImperativeAPI) => {
    const _throttledRelayVisibleSceneBounds = throttle(relayVisibleSceneBounds, 500);
    throttledRelayVisibleSceneBounds.current = _throttledRelayVisibleSceneBounds;
    api.onUserFollow(handleOnUserFollow);
    api.onScrollChange(() => _throttledRelayVisibleSceneBounds());
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
        initialData={initialScene}
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
