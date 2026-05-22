// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { RecordingStatus, StreamStatus } from '@opentalk/rest-api-rtk-query';
import i18next from 'i18next';

import {
  createStackedMessages,
  notificationAction,
  notifications,
  setLibravatarOptions,
  showConsentNotification,
  startTimeLimitNotification,
} from '../../commonComponents';
import { createStreamUpdatedNotification } from '../../components/StreamUpdatedNotification';
import type { AppDispatch, RootState } from '../../store';
import { joinSuccess } from '../../store/commonActions';
import { setChatSettings } from '../../store/slices/chatSlice';
import { selectLibravatarDefaultImage } from '../../store/slices/configSlice';
import {
  join,
  leave,
  selectParticipantsTotal,
  waitingRoomJoined,
  waitingRoomLeft,
} from '../../store/slices/participantsSlice';
import { roomParametersChanged, enteredWaitingRoom, selectParticipantLimit } from '../../store/slices/roomSlice';
import { selectIsModerator } from '../../store/slices/userSlice';
import { setEditRestrictions, setWhiteboardAvailable, updateRemoteScene } from '../../store/slices/whiteboardSlice';
import {
  AutomodSelectionStrategy,
  CorePeerState,
  JoinSuccessRoomserver,
  MeetingNotesAccess,
  Participant,
  ParticipantId,
  ParticipationKind,
  Role,
  RoomKind,
  RoomserverParticipant,
  Timestamp,
  WaitingState,
} from '../../types';
import { core } from '../types/incoming';
import { RoomserverMessageKey } from '../types/incoming/core';
import { switchRoom } from '../types/outgoing/breakout';
import { startedId } from './automod';
import { mapMeetingNotesToMeetingNotesAccess } from './helpers';

const mapRoomserverParticipantToUi = (
  state: RootState,
  participant: RoomserverParticipant,
  waitingState: WaitingState
): Participant => {
  return {
    id: participant.id,
    connections: participant.connections.map((conn) => conn.connectionId),
    displayName: participant.moduleData.core.displayName,
    avatarUrl: setLibravatarOptions(participant.moduleData.core.avatarUrl, {
      defaultImage: selectLibravatarDefaultImage(state),
    }),
    handIsUp: Boolean(participant.moduleData.raiseHands?.raisedAt),
    joinedAt: participant.moduleData.core.joinedAt,
    leftAt: participant.moduleData.core.leftAt ?? null,
    handUpdatedAt: participant.moduleData.raiseHands?.raisedAt,
    breakoutRoomId: participant.moduleData.breakout?.room?.id,
    participationKind: participant.moduleData.core.participationKind,
    lastActive: new Date().toISOString(),
    role: participant.moduleData.core.role,
    waitingState,
    meetingNotesAccess: mapMeetingNotesToMeetingNotesAccess(participant.moduleData.meetingNotes),
    isRoomOwner: participant.moduleData.core.isRoomOwner,
  };
};

const mapJoinedParticipantToUi = (
  state: RootState,
  participant: core.ParticipantConnected,
  waitingState: WaitingState
): Participant => ({
  id: participant.participantId,
  connections: [participant.connectionId],
  displayName: participant.peerData.core.displayName,
  avatarUrl: setLibravatarOptions(participant.peerData.core.avatarUrl, {
    defaultImage: selectLibravatarDefaultImage(state),
  }),
  handIsUp: Boolean(participant.peerData.raiseHands?.raisedAt),
  joinedAt: participant.peerData.core.joinedAt,
  leftAt: null,
  handUpdatedAt: participant.peerData.raiseHands?.raisedAt,
  breakoutRoomId: participant.peerData.breakout?.room.id,
  participationKind: participant.peerData.core.participationKind,
  lastActive: new Date().toISOString(),
  role: participant.peerData.core.role,
  waitingState,
  meetingNotesAccess: mapMeetingNotesToMeetingNotesAccess(participant.peerData.meetingNotes),
  isRoomOwner: participant.peerData.core.isRoomOwner,
});

const leastPopulatedBreakoutRoomId = (joinSuccess: JoinSuccessRoomserver) => {
  const rooms = joinSuccess.moduleData.breakout?.rooms ?? [];
  if (rooms.length === 0) {
    return null;
  }

  const counts = rooms.reduce((map, r) => map.set(r.id, 0), new Map<number, number>());
  joinSuccess.participants.forEach((p) => {
    const { id, kind } = p.moduleData.breakout?.room ?? {};
    if (kind === 'breakout' && typeof id === 'number') {
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  });

  return (
    rooms.map((r) => ({ ...r, count: counts.get(r.id) ?? 0 })).sort((a, b) => a.count - b.count || a.id - b.id)[0]
      ?.id ?? null
  );
};

export const handleRoomServerCoreMessage = async (
  dispatch: AppDispatch,
  data: core.Message,
  timestamp: Timestamp,
  state: RootState
) => {
  switch (data.message) {
    case RoomserverMessageKey.JoinSuccess: {
      const moduleData = data.moduleData;
      const participants = data.participants;

      const participantsReady = participants
        .filter((participant) => participant.moduleData.timer && participant.moduleData.timer.readyStatus === true)
        .map((participant) => participant.id as ParticipantId);

      const chatEnabled = moduleData.chat.enabled;
      if (!chatEnabled) {
        dispatch(setChatSettings({ id: data.id, timestamp, enabled: chatEnabled }));
      }

      // const maximumStorage = data.tariff.quotas?.maxStorage;
      // const usedStorage = data.assetStorage?.usedStorage;

      // if (usedStorage) {
      //   if (usedStorage >= maximumStorage) {
      //     showStorageNotification(state, 'error');
      //   } else if (usedStorage >= maximumStorage * 0.95) {
      //     showStorageNotification(state, 'warning');
      //   }
      // }

      // handles different connections(tabs) of your own user
      if (data.connections.length > 0) {
        const coreModuleData: CorePeerState = {
          displayName: data.displayName,
          role: data.role,
          participationKind: ParticipationKind.Registered,
          joinedAt: new Date().toISOString() as Timestamp,
          isRoomOwner: data.isRoomOwner,
        };

        participants.push({
          id: data.id,
          connections: data.connections,
          moduleData: { ...moduleData, core: coreModuleData },
        });
      }

      let joinedParticipants = participants.map((participant) => {
        return mapRoomserverParticipantToUi(state, participant, WaitingState.Joined);
      });

      if (moduleData.moderation?.waitingRoomEnabled && moduleData.moderation.waitingRoomParticipants?.length > 0) {
        const waitingParticipants: Participant[] = moduleData.moderation.waitingRoomParticipants.map(
          (waitingParticipant) => {
            // TODO - still needed?
            // There can be a situation, that some participants are in both arrays (e.g. after Debriefing)
            // Therefore we should give priority to the waiting room, and remove them from the joined participants array
            const duplicateParticipantIndex = joinedParticipants.findIndex(
              (participant: Participant) => participant.id === waitingParticipant.participantId
            );
            if (duplicateParticipantIndex > -1) {
              joinedParticipants.splice(duplicateParticipantIndex, 1);
            }

            return {
              id: waitingParticipant.participantId,
              connections: waitingParticipant.connections,
              displayName: waitingParticipant.displayName,
              avatarUrl: setLibravatarOptions(waitingParticipant.avatarUrl, {
                defaultImage: selectLibravatarDefaultImage(state),
              }),
              handIsUp: false,
              joinedAt: waitingParticipant.joinedAt,
              leftAt: null,
              handUpdatedAt: undefined,
              breakoutRoomId: undefined,
              participationKind: ParticipationKind.Registered,
              lastActive: new Date().toISOString(),
              role: undefined,
              waitingState: WaitingState.Waiting,
              meetingNotesAccess: MeetingNotesAccess.None,
              isRoomOwner: false,
            };
          }
        );

        joinedParticipants = joinedParticipants.concat(waitingParticipants);
      }

      const serverTimeOffset = new Date(timestamp).getTime() - Date.now();
      const enabledModules = data.enabledModules;
      dispatch(
        joinSuccess({
          participantId: data.id,
          connectionId: data.connectionId,
          avatarUrl: setLibravatarOptions(data.avatarUrl, { defaultImage: selectLibravatarDefaultImage(state) }),
          role: data.role,
          chat: moduleData.chat,
          automod: moduleData.automod,
          breakout: moduleData.breakout,
          polls: moduleData.polls,
          votes: moduleData.legalVote?.votes,
          participants: joinedParticipants,
          moderation: moduleData.moderation,
          forceMute: moduleData.livekit?.microphoneRestrictionState,
          recording: moduleData.recording,
          serverTimeOffset,
          tariff: data.tariff,
          timer: moduleData.timer,
          participantsReady,
          sharedFolder: moduleData.sharedFolder,
          eventInfo: data.eventInfo,
          meetingDetails: data.meetingDetails,
          roomInfo: data.roomInfo,
          isRoomOwner: data.isRoomOwner,
          livekit: moduleData.livekit,
          enabledModules,
          trainingParticipationReport: moduleData.trainingParticipationReport,
        })
      );

      if (moduleData.automod && moduleData.automod.config.selectionStrategy === AutomodSelectionStrategy.Playlist) {
        notificationAction({
          key: startedId,
          msg: createStackedMessages([
            i18next.t('talking-stick-started-first-line'),
            i18next.t('talking-stick-started-second-line'),
          ]),
          variant: 'info',
          ariaLive: 'polite',
        });
      }

      if (state.config.spacedeck.enabled && moduleData.whiteboard?.status === 'initialized') {
        dispatch(setWhiteboardAvailable({ url: moduleData.whiteboard.url }));
      }
      if (moduleData.excalidraw && 'elements' in moduleData.excalidraw.scene) {
        dispatch(
          updateRemoteScene({
            elements: moduleData.excalidraw.scene.elements,
            appState: moduleData.excalidraw.scene.appState,
          })
        );
        dispatch(
          setEditRestrictions({
            enabled: moduleData.excalidraw.editRestrictions.type === 'enabled',
            participants:
              'unrestrictedParticipants' in moduleData.excalidraw.editRestrictions
                ? moduleData.excalidraw.editRestrictions.unrestrictedParticipants
                : undefined,
          })
        );
      }

      if (data.closesAt) {
        await startTimeLimitNotification(data.closesAt);
      }

      // Notify moderator, in case he took the last position of the room and now it's full
      if (data.role === Role.Moderator) {
        const onlineParticipants = joinedParticipants.filter((participant) => {
          const hasNotLeft = participant.leftAt === null;
          const isInRoom = participant.waitingState === WaitingState.Joined;
          const isInTheSameBreakoutRoom = moduleData.breakout?.room.id
            ? participant.breakoutRoomId === moduleData.breakout?.room.id
            : true;
          return hasNotLeft && isInRoom && isInTheSameBreakoutRoom;
        });
        // Redux store has not been updated yet, therefore we have to add us manually
        const onlineParticipantsNumberPlusMe = onlineParticipants.length + 1;
        const participantLimit = data.tariff.quotas?.roomParticipantLimit;
        if (onlineParticipantsNumberPlusMe >= participantLimit) {
          notifications.error(i18next.t('meeting-notification-participant-limit-reached', { participantLimit }));
        }
      }

      // Show notification for active streaming target
      const activeTarget =
        moduleData.recording &&
        Object.values(moduleData.recording.streamStates).find((target) => target.status === StreamStatus.Active);

      if (activeTarget) {
        createStreamUpdatedNotification({
          status: activeTarget.status,
          publicUrl: activeTarget.publicUrl,
        });
      }

      if (
        moduleData.recording?.recordingState.status === RecordingStatus.Active &&
        state.streaming.consent === undefined
      ) {
        showConsentNotification(dispatch);
      }

      // Switch to a breakout room, if a breakout session is active
      if (moduleData.breakout && moduleData.breakout.room.kind === RoomKind.Main) {
        const breakoutRoomId = leastPopulatedBreakoutRoomId(data);
        if (breakoutRoomId !== null) {
          dispatch(
            switchRoom.action({
              kind: RoomKind.Breakout,
              id: breakoutRoomId,
            })
          );
        }
      }
      break;
    }
    case RoomserverMessageKey.ParticipantConnected: {
      dispatch(
        join({
          participant: mapJoinedParticipantToUi(state, data, WaitingState.Joined),
        })
      );

      // Notify moderator, in case a participant took the last position of the room and now it's full
      if (selectIsModerator(state)) {
        const participantLimit = selectParticipantLimit(state);
        // Redux store has not been updated yet, therefore we have to add new guest manually
        const onlineParticipantsPlusTheNewOne = selectParticipantsTotal(state) + 1;
        if (onlineParticipantsPlusTheNewOne >= participantLimit) {
          notifications.error(i18next.t('meeting-notification-participant-limit-reached', { participantLimit }));
        }
      }
      break;
    }
    case RoomserverMessageKey.ParticipantDisconnected: {
      dispatch(
        leave({
          id: data.participantId,
          connection: data.connectionId,
          timestamp,
          reason: data.reason,
        })
      );
      break;
    }
    case RoomserverMessageKey.InWaitingRoom: {
      dispatch(enteredWaitingRoom());
      break;
    }
    case RoomserverMessageKey.JoinedWaitingRoom:
      dispatch(waitingRoomJoined(data));
      break;
    case RoomserverMessageKey.LeftWaitingRoom: {
      dispatch(waitingRoomLeft(data.id));
      break;
    }
    case RoomserverMessageKey.RoomParametersChanged: {
      dispatch(roomParametersChanged(data.change));
      break;
    }
  }
};
