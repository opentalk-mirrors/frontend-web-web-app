// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, ListItemIcon, MenuList, Divider as MuiDivider, Stack, Typography, styled } from '@mui/material';
import { BackendModules, StreamingStatus } from '@opentalk/rest-api-rtk-query';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { clearGlobalChatMessages, disableChat, enableChat } from '../../../api/types/outgoing/chat';
import {
  disableMicrophoneRestrictions,
  enableMicrophoneRestrictions,
  requestMute,
} from '../../../api/types/outgoing/livekit';
import { generateAttendanceReport } from '../../../api/types/outgoing/meetingReport';
import {
  disableRaiseHands,
  disableWaitingRoom,
  enableRaiseHands,
  enableWaitingRoom,
} from '../../../api/types/outgoing/moderation';
import { sendStartStreamSignal, sendStopStreamSignal } from '../../../api/types/outgoing/streaming';
import { disablePresenceLogging, enablePresenceLogging } from '../../../api/types/outgoing/trainingParticipationReport';
import {
  AddUserIcon,
  AttendanceReportIcon,
  CloseIcon,
  DoneIcon,
  ErrorIcon,
  LiveIcon,
  MicOffIcon,
  MicOnIcon,
  RaiseHandOffIcon,
  RaiseHandOnIcon,
  RecordingsIcon,
  TimerIcon,
  TrashIcon,
} from '../../../assets/icons';
import ShareScreenOnIcon from '../../../assets/icons/ShareScreenOnIcon';
import {
  ParticipantAvatar,
  notificationAction,
  notificationPersistent,
  notifications,
} from '../../../commonComponents';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { selectChatEnabledState } from '../../../store/slices/chatSlice';
import { selectConfigFeatures, selectIsFeatureEnabled, selectIsModuleEnabled } from '../../../store/slices/configSlice';
import { selectFullscreenElement } from '../../../store/slices/fullscreen/slice';
import {
  selectMicrophonesEnabled,
  selectRaiseHandsEnabled,
  selectTrainingParticipationReportEnabled,
} from '../../../store/slices/moderationSlice';
import { selectAllModeratorParticipants } from '../../../store/slices/participantsSlice';
import { selectIsRoomOwner, selectWaitingRoomState } from '../../../store/slices/roomSlice';
import {
  selectActiveStreamIds,
  selectInactiveStreamIds,
  selectRecordingTarget,
} from '../../../store/slices/streamingSlice';
import { selectAvatarUrl, selectDisplayName, selectIsModerator, selectOurUuid } from '../../../store/slices/userSlice';
import { isDevMode } from '../../../utils/devMode';
import InviteGuestDialog from './InviteGuestDialog';
import { ToolbarMenu, ToolbarMenuItem, ToolbarMenuProps } from './ToolbarMenuUtils';

interface MenuEntry {
  label: string;
  action: (e: React.MouseEvent) => void;
  icon: React.ReactNode;
}

const MoreMenu = ({ anchorEl, onClose, open }: ToolbarMenuProps) => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { t } = useTranslation();
  const isModerator = useAppSelector(selectIsModerator);
  const participantId = useAppSelector(selectOurUuid);
  const moderatorParticipants = useAppSelector(selectAllModeratorParticipants);
  const unrestrictedParticipants = moderatorParticipants.map((p) => p.id).concat(participantId ? [participantId] : []);
  const displayName = useAppSelector(selectDisplayName);
  const avatarUrl = useAppSelector(selectAvatarUrl);
  const isRoomOwner = useAppSelector(selectIsRoomOwner);
  const isWaitingRoomActive = useAppSelector(selectWaitingRoomState);
  const hasHandraisesEnabled = useAppSelector(selectRaiseHandsEnabled);
  const hasMicrophonesEnabled = useAppSelector(selectMicrophonesEnabled);
  const isChatEnabled = useAppSelector(selectChatEnabledState);
  const dispatch = useAppDispatch();
  const recording = useAppSelector(selectRecordingTarget);
  const activeStreamIds = useAppSelector(selectActiveStreamIds);
  const inactiveStreamIds = useAppSelector(selectInactiveStreamIds);
  const hasRecordingFeatureOn = useAppSelector(selectIsFeatureEnabled('record'));
  const isGuestsAllowedFeatureEnabled = useAppSelector(selectIsFeatureEnabled('guests_allowed'));
  const isMeetingReportAvailable = useAppSelector(selectIsModuleEnabled(BackendModules.MeetingReport));
  const configFeatures = useAppSelector(selectConfigFeatures);
  const userMenuItems: Array<MenuEntry> = [];
  const fullScreenElement = useAppSelector(selectFullscreenElement);

  const isTrainingParticipationReportModuleOn = useAppSelector(
    selectIsModuleEnabled(BackendModules.TrainingParticipationReport)
  );
  const isTrainingParticipationReportEnabled = useAppSelector(selectTrainingParticipationReportEnabled);

  const inviteGuestItem = {
    label: 'more-menu-create-invite',
    action: () => {
      setShowInviteModal(true);
      onClose();
    },
    icon: <AddUserIcon />,
  };

  const toggleWaitingRoomItem = isWaitingRoomActive
    ? {
        label: 'more-menu-disable-waiting-room',
        action: () => {
          onClose();
          dispatch(disableWaitingRoom.action());
          notifications.info(t('waiting-room-disabled-message'));
        },
        icon: <TimerIcon />,
      }
    : {
        label: 'more-menu-enable-waiting-room',
        action: () => {
          onClose();
          dispatch(enableWaitingRoom.action());
          notifications.info(t('waiting-room-enabled-message'));
        },
        icon: <TimerIcon />,
      };

  const toggleHandraises = hasHandraisesEnabled
    ? {
        label: 'more-menu-turn-handraises-off',
        action: () => {
          onClose();
          dispatch(disableRaiseHands.action());
        },
        icon: <RaiseHandOffIcon />,
      }
    : {
        label: 'more-menu-turn-handraises-on',
        action: () => {
          onClose();
          dispatch(enableRaiseHands.action());
        },
        icon: <RaiseHandOnIcon />,
      };

  const toggleMicrophones = hasMicrophonesEnabled
    ? {
        label: 'more-menu-disable-microphones',
        action: () => {
          if (participantId) {
            onClose();
            dispatch(enableMicrophoneRestrictions.action({ unrestrictedParticipants }));
            dispatch(requestMute.action({ participants: moderatorParticipants.map((p) => p.id) }));
          }
        },
        icon: <MicOffIcon />,
      }
    : {
        label: 'more-menu-enable-microphones',
        action: () => {
          onClose();
          dispatch(disableMicrophoneRestrictions.action());
        },
        icon: <MicOnIcon />,
      };

  const togglePresenceLogging = isTrainingParticipationReportEnabled
    ? {
        label: 'training-participation-logging-disable-button',
        action: () => {
          onClose();
          dispatch(disablePresenceLogging.action());
        },
        icon: <CloseIcon />,
      }
    : {
        label: 'training-participation-logging-enable-button',
        action: () => {
          onClose();
          dispatch(enablePresenceLogging.action({}));
        },
        icon: <DoneIcon />,
      };

  const toggleChatItem = isChatEnabled
    ? {
        label: 'more-menu-disable-chat',
        action: () => {
          onClose();
          dispatch(disableChat.action());
        },
        icon: <CloseIcon />,
      }
    : {
        label: 'more-menu-enable-chat',
        action: () => {
          onClose();
          dispatch(enableChat.action());
        },
        icon: <DoneIcon />,
      };

  const deleteGlobalChatItem = {
    label: 'more-menu-delete-global-chat',
    icon: <TrashIcon />,
    action: () => {
      onClose();
      dispatch(clearGlobalChatMessages.action());
    },
  };

  const exportAttendanceReportItem = {
    label: 'more-menu-export-attendance-report',
    icon: <AttendanceReportIcon />,
    action: () => {
      onClose();
      dispatch(generateAttendanceReport.action({ includeEmailAddresses: false }));
    },
  };

  const moderatorMenuItems: Array<MenuEntry> = [];

  // Only room owner is allowed to create invites
  if (isRoomOwner && isGuestsAllowedFeatureEnabled) {
    moderatorMenuItems.push(inviteGuestItem);
  }

  moderatorMenuItems.push(toggleWaitingRoomItem);
  moderatorMenuItems.push(toggleHandraises);
  moderatorMenuItems.push(toggleMicrophones);
  moderatorMenuItems.push(toggleChatItem);
  moderatorMenuItems.push(deleteGlobalChatItem);

  if (isMeetingReportAvailable) {
    moderatorMenuItems.push(exportAttendanceReportItem);
  }

  if (isRoomOwner && isTrainingParticipationReportModuleOn) {
    moderatorMenuItems.push(togglePresenceLogging);
  }

  //Exclude start/stop recording when errored/unavailable until we have designs/approach for how to handle errored and unavailable streams
  const isValidRecordingTarget =
    recording && recording.status !== StreamingStatus.Error && recording.status !== StreamingStatus.Unavailable;

  if (hasRecordingFeatureOn && isValidRecordingTarget) {
    switch (recording.status) {
      case StreamingStatus.Active:
        moderatorMenuItems.push({
          label: 'more-menu-stop-recording',
          action: () => {
            dispatch(sendStopStreamSignal.action({ targetIds: [recording.targetId] }));
            onClose();
          },
          icon: <RecordingsIcon />,
        });
        break;
      case StreamingStatus.Inactive:
        moderatorMenuItems.push({
          label: 'more-menu-start-recording',
          action: () => {
            dispatch(sendStartStreamSignal.action({ targetIds: [recording.targetId] }));
            onClose();
          },
          icon: <RecordingsIcon />,
        });
        break;
    }
  }

  if (activeStreamIds.length > 0) {
    moderatorMenuItems.push({
      label: 'more-menu-stop-streaming',
      action: () => {
        dispatch(sendStopStreamSignal.action({ targetIds: activeStreamIds }));
        onClose();
      },
      icon: <LiveIcon />,
    });
  } else if (inactiveStreamIds.length > 0) {
    moderatorMenuItems.push({
      label: 'more-menu-start-streaming',
      action: () => {
        dispatch(sendStartStreamSignal.action({ targetIds: inactiveStreamIds }));
        onClose();
      },
      icon: <LiveIcon />,
    });
  }

  if (configFeatures?.innovafoneAPI) {
    userMenuItems.push({
      label: 'more-menu-start-remote-control',
      action: () => {
        window.open('com.innovaphone.myapps:remotecontrol', '_blank');
      },
      icon: <ShareScreenOnIcon />,
    });
  }

  const devMenuItems = [
    {
      label: 'Show Binary Action',
      action: () =>
        notifications.binaryAction('Hello World', {
          primaryBtnText: 'Primary',
          secondaryBtnText: 'Secondary',
          onPrimary: () => alert('Primary button clicked'),
          onSecondary: () => alert('Secondary button clicked'),
          persist: true,
          type: 'error',
        }),
      icon: <ErrorIcon />,
    },
    {
      label: 'Show Test Error',
      action: () => notifications.error(`Test error context: ${new Error('Test Error')}`),
      icon: <ErrorIcon />,
    },
    {
      label: 'Show Test Warning',
      action: () => notifications.warning('Ooops...you just triggered a warning.'),
      icon: <ErrorIcon />,
    },
    {
      label: 'Show Test Success',
      action: () => notifications.info('This is an info message.'),
      icon: <ErrorIcon />,
    },
    {
      label: 'Show Test Info',
      action: () => notifications.success('You just triggered this notification. Success!'),
      icon: <ErrorIcon />,
    },
    {
      label: 'Action Cancel Btn Success',
      action: () =>
        notificationAction({
          msg: 'You just triggered this notification. Success!',
          variant: 'success',
          ariaLive: 'polite',
          cancelBtnText: 'Dismiss',
          onCancel: () => alert('Callback fnc to handle click, Action Cancel Btn Success'),
        }),
      icon: <ErrorIcon />,
    },
    {
      label: 'Action Warning',
      action: () =>
        notificationAction({
          msg: 'Ooops...you just triggered a warning.',
          variant: 'warning',
          ariaLive: 'polite',
          actionBtnText: 'Next',
          cancelBtnText: 'Dismiss',
          onAction: () => alert('Callback fnc to handle click, User Agree'),
          onCancel: () => alert('Callback fnc to handle click, User Dismissed'),
        }),
      icon: <ErrorIcon />,
    },
    {
      label: 'Persistent error',
      action: () =>
        notificationPersistent({ msg: "This is an error that won't go away", variant: 'error', ariaLive: 'assertive' }),
      icon: <ErrorIcon />,
    },
    {
      label: 'Test Kill Signaling',
      action: () => {
        const windowRef = window as Window;
        windowRef.debugKillSignaling();
      },
      icon: <ErrorIcon />,
    },
    {
      label: 'Test Glitchtip Integration',
      action: function glitchtipTriggerFunction() {
        throw new Error('Hello Glitchtip');
      },
      icon: <ErrorIcon />,
    },
  ];
  const devMenuTrainingParticipationToggle = isTrainingParticipationReportEnabled
    ? {
        label: `Test training participation report off`,
        action: () => {
          onClose();
          dispatch(disablePresenceLogging.action());
        },
        icon: <CloseIcon />,
      }
    : {
        label: `Test training participation report on`,
        action: () => {
          onClose();
          dispatch(
            enablePresenceLogging.action({
              initialCheckpointDelay: { after: 5, within: 10 },
              checkpointInterval: { after: 10, within: 5 },
            })
          );
        },
        icon: <ErrorIcon />,
      };

  if (isTrainingParticipationReportModuleOn) {
    devMenuItems.push(devMenuTrainingParticipationToggle);
  }

  const renderMenuItems = (menuEntries: Array<MenuEntry>) =>
    menuEntries.map(({ label, action, icon }) => (
      <ToolbarMenuItem key={label} onClick={action}>
        <ListItemIcon>{icon}</ListItemIcon>
        <Typography variant="inherit" noWrap>
          {t(label)}
        </Typography>
      </ToolbarMenuItem>
    ));

  const MenuTitleContainer = styled(Stack)(({ theme }) => ({
    alignItems: 'center',
    padding: theme.spacing(0, 2, 0, 1),
    justifyContent: 'space-between',
    color: theme.palette.text.primary,
  }));

  const MenuTitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.pxToRem(14),
    fontWeight: 'initial',
  }));

  const Avatar = styled(ParticipantAvatar)({
    transform: 'scale(0.5)',
  });

  const Divider = styled(MuiDivider)({
    marginTop: 0,
  });

  return (
    <>
      <ToolbarMenu
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: -4,
          horizontal: 'center',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        data-testid="moreMenu"
        container={fullScreenElement}
        slotProps={{
          paper: {
            'aria-label': t('toolbar-button-more-tooltip-title'),
          },
        }}
        aria-label={t('toolbar-button-more-tooltip-title')}
      >
        <MenuTitleContainer direction="row" spacing={2}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Avatar src={avatarUrl}>{displayName}</Avatar>
            <MenuTitle translate="no">{displayName}</MenuTitle>
          </Box>
          <small>{window.config.version?.product || t('dev-version')}</small>
        </MenuTitleContainer>
        <Divider />
        <MenuList autoFocusItem={Boolean(anchorEl)} aria-label={t('toolbar-button-more-tooltip-title')}>
          {isModerator && renderMenuItems(moderatorMenuItems)}
          {renderMenuItems(userMenuItems)}
          {isDevMode() && renderMenuItems(devMenuItems)}
        </MenuList>
      </ToolbarMenu>
      <InviteGuestDialog open={showInviteModal} onClose={() => setShowInviteModal(false)} />
    </>
  );
};

export default MoreMenu;
