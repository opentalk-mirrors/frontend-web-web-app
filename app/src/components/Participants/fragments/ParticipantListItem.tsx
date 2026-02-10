// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useLocalParticipant, useRemoteParticipant } from '@livekit/components-react';
import {
  Badge,
  Box,
  ListItem as MuiListItem,
  ListItemAvatar as MuiListItemAvatar,
  ListItemText as MuiListItemText,
  Typography,
  styled,
} from '@mui/material';
import { BackendModules } from '@opentalk/rest-api-rtk-query';
import { format } from 'date-fns';
import { isEmpty, uniqueId } from 'lodash';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { RowComponentProps } from 'react-window';

import { grantScreenSharePermission, revokeScreenSharePermission } from '../../../api/types/outgoing/livekit';
import { sendParticipantToWaitingRoom, mute, updateRole } from '../../../api/types/outgoing/moderation';
import { inviteToWhisperGroup, leaveWhisperGroup, requestWhisperGroup } from '../../../api/types/outgoing/subroomAudio';
import {
  MeetingNotesIcon,
  MicOffIcon,
  MicOnIcon,
  ModeratorIcon,
  MoreIcon,
  PhoneIcon,
  RaiseHandOnIcon,
  ShareScreenOnIcon,
  TelephoneStrokeIcon,
} from '../../../assets/icons';
import { IconButton, ParticipantAvatar, notifications } from '../../../commonComponents';
import { LIVEKIT_SCREEN_SHARE_PERMISSION_NUMBER } from '../../../constants';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { selectEnabledModulesList } from '../../../store/slices/configSlice';
import { selectHandUp } from '../../../store/slices/moderationSlice';
import {
  selectIsWhisperActive,
  selectSubroomAudioParticipants,
  selectWhisperGroupId,
} from '../../../store/slices/subroomAudioSlice';
import {
  chatConversationStateSet,
  selectParticipantsSortOption,
  setCurrentMenuTab,
} from '../../../store/slices/uiSlice';
import { selectIsModerator, selectOurUuid, selectUserMeetingNotesAccess } from '../../../store/slices/userSlice';
import {
  ChatScope,
  MeetingNotesAccess,
  Participant,
  ParticipantId,
  ParticipationKind,
  Role,
  SortOption,
  WhisperParticipantState,
} from '../../../types';
import { MenuTab } from '../../MenuTabs/fragments/constants';
import ParticipantMenu, { ParticipantMenuOption } from './ParticipantMenu';
import ParticipantRemovalDialog from './ParticipantRemovalDialog';
import RenameParticipantDialog from './RenameParticipantDialog';
import WhisperStateIcon from './WhisperStateIcon';

const Avatar = styled(ParticipantAvatar)({
  width: '2.25rem',
  height: '2.25rem',
  fontSize: '0.75rem',
});

const ListItemAvatar = styled(MuiListItemAvatar)({
  minWidth: 'initial',
});

const ListItem = styled(MuiListItem, {
  shouldForwardProp: (prop) => !(['isWhispering', 'isMoreMenuOpen'] as Array<PropertyKey>).includes(prop),
})<{ isMoreMenuOpen?: boolean; isWhispering?: boolean }>(({ theme, isMoreMenuOpen, isWhispering }) => ({
  padding: theme.spacing(1),
  '& .more-icon': {
    color: isMoreMenuOpen ? theme.palette.text.primary : 'transparent',
  },
  border: `1px solid`,
  borderColor: isWhispering ? theme.palette.secondary.main : 'transparent',
  borderRadius: theme.spacing(1),
}));

const ParticipantMenuButton = styled(IconButton)(({ theme }) => ({
  ':hover, :focus': {
    '& .more-icon': {
      color: theme.palette.text.primary,
    },
  },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, 30%)',
    background: theme.palette.background.highlightContrast.primary,
    width: '100%',
  },
  '& .MuiSvgIcon-root': {
    width: '20px',
    color: theme.palette.secondary.main,
  },
}));

const MicOffIconStyled = styled(MicOffIcon)({
  opacity: '0.5',
});

const PhoneOffIconStyled = styled(TelephoneStrokeIcon)({
  opacity: '0.5',
});

const ListItemText = styled(MuiListItemText)(({ theme }) => ({
  padding: theme.spacing(0, 1),
  '& p': {
    fontWeight: 400,
    lineHeight: 1,
  },
}));

const IconsContainer = styled(Box)({
  alignItems: 'center',
  display: 'flex',
  '& svg': {
    width: '0.8em',
    height: '0.8em',
  },
});

type ParticipantRowProps = {
  data: Participant[];
};

const PARTICIPANT_MENU_ID = 'participant_menu_id';

const ParticipantListItem = ({ data, index, style }: RowComponentProps<ParticipantRowProps>) => {
  const participant = data[index];
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>();
  const sortType = useAppSelector(selectParticipantsSortOption);
  const isCurrentUserModerator = useAppSelector(selectIsModerator);
  const { t } = useTranslation();
  const isSipParticipant = participant.participationKind === ParticipationKind.CallIn;
  const dispatch = useAppDispatch();
  const open = Boolean(anchorEl);
  const ownId = useAppSelector(selectOurUuid);
  const isParticipantSelf = participant.id === ownId;
  const userMeetingNotesAccess = useAppSelector(selectUserMeetingNotesAccess);
  const ownHandRaised = useAppSelector(selectHandUp);
  const whisperRoomParticipants = useAppSelector(selectSubroomAudioParticipants);
  const [openRenameDialog, setOpenRenameDialog] = useState(false);
  const [openRemovalDialog, setOpenRemovalDialog] = useState(false);

  const subroomAudioEnabled = useAppSelector(selectEnabledModulesList).includes(BackendModules.SubroomAudio);

  const selectedParticipant = useRemoteParticipant(participant.id);
  const participantId = participant.id;
  const selectedParticipantCanPublishScreenShare =
    selectedParticipant?.permissions?.canPublishSources?.includes(LIVEKIT_SCREEN_SHARE_PERMISSION_NUMBER) || false;
  const audioActive = selectedParticipant?.isMicrophoneEnabled || false;
  const screenShareActive = selectedParticipant?.isScreenShareEnabled || false;

  const localParticipant = useLocalParticipant();
  const ownAudioEnabled = localParticipant.isMicrophoneEnabled;
  const ownScreenShareEnabled = localParticipant.isScreenShareEnabled;
  const isWhisperActive = useAppSelector(selectIsWhisperActive);
  const whisperGroupId = useAppSelector(selectWhisperGroupId);

  const closePopover = () => {
    setAnchorEl(undefined);
  };
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleRemoval = () => {
    setOpenRemovalDialog(!openRemovalDialog);
    closePopover();
  };

  const handleMoveToWaitingRoom = () => {
    closePopover();
    if (participant.participationKind) {
      dispatch(sendParticipantToWaitingRoom.action({ target: participantId }));
      notifications.info(t('meeting-notification-user-moved-to-waiting-room'));
      return;
    }

    notifications.error(t('dashboard-meeting-notification-error'));
  };

  const handleModerationRight = () => {
    const newRole = participant?.role === Role.Moderator ? Role.User : Role.Moderator;
    dispatch(updateRole.action({ participantId, newRole }));
    closePopover();
  };

  const handlePresenterRoleRight = () => {
    selectedParticipantCanPublishScreenShare
      ? dispatch(revokeScreenSharePermission.action({ participants: [participantId] }))
      : dispatch(grantScreenSharePermission.action({ participants: [participantId] }));
  };

  const handleMuting = () => {
    dispatch(mute.action({ participants: [participantId] }));
    closePopover();
  };

  const handleRenameParticipantDialog = () => {
    setOpenRenameDialog(!openRenameDialog);
    setAnchorEl(undefined);
  };

  const muteOption = audioActive && {
    i18nKey: 'participant-menu-mute',
    action: handleMuting,
    disabled: !audioActive, // In case we want to show option always, but want to disable it.
  };

  const moderatorRights = (): ParticipantMenuOption[] => {
    let options: (ParticipantMenuOption | false)[] = [];
    switch (participant.role) {
      case Role.Moderator:
        options = [
          {
            i18nKey: 'participant-menu-revoke-moderator',
            action: handleModerationRight,
            disabled: participant.isRoomOwner,
          },
          muteOption,
        ];
        break;
      case Role.User: {
        if (participant.participationKind === ParticipationKind.Registered) {
          options = [
            {
              i18nKey: 'participant-menu-grant-moderator',
              action: handleModerationRight,
            },
            {
              i18nKey: selectedParticipantCanPublishScreenShare ? 'revoke-presenter-role' : 'grant-presenter-role',
              action: handlePresenterRoleRight,
            },
            muteOption,
          ];
        } else if (participant.participationKind === ParticipationKind.Guest) {
          options = [
            {
              i18nKey: 'participant-menu-rename',
              action: handleRenameParticipantDialog,
            },
            {
              i18nKey: selectedParticipantCanPublishScreenShare ? 'revoke-presenter-role' : 'grant-presenter-role',
              action: handlePresenterRoleRight,
            },
            muteOption,
          ];
        }
        break;
      }
      default:
        options = [];
    }

    return options.filter(Boolean) as ParticipantMenuOption[]; // Remove conditionally excluded menu options.
  };

  const subroomAudioParticipantIds = whisperRoomParticipants.map(
    (whisperParticipant) => whisperParticipant.participantId
  );
  const getParticipantInviteState = (participantId: ParticipantId | null) =>
    whisperRoomParticipants.find((p) => p.participantId === participantId)?.state;

  const participantIsInSameWhisperGroup =
    whisperGroupId &&
    subroomAudioParticipantIds.includes(participantId) &&
    getParticipantInviteState(participantId) !== WhisperParticipantState.Invited;

  const userIsInWhisperGroup = whisperGroupId && getParticipantInviteState(ownId) !== WhisperParticipantState.Invited;

  const initiatedWhisperGroup = whisperGroupId && getParticipantInviteState(ownId) === WhisperParticipantState.Creator;

  const subroomAudioOptions = (): ParticipantMenuOption[] => {
    if (!subroomAudioEnabled) {
      return [];
    }

    if (!userIsInWhisperGroup && !isSipParticipant) {
      return [
        {
          i18nKey: 'participant-menu-start-whisper',
          action: () => {
            dispatch(requestWhisperGroup.action({ participantIds: [participantId] }));
            closePopover();
          },
        },
      ];
    }
    if (userIsInWhisperGroup && initiatedWhisperGroup && !participantIsInSameWhisperGroup) {
      return [
        {
          i18nKey: 'participant-menu-invite-whisper-partner',
          action: () => {
            dispatch(inviteToWhisperGroup.action({ whisperId: whisperGroupId, participantIds: [participantId] }));
            closePopover();
          },
        },
      ];
    }
    return [];
  };

  const participantMenuOptionItems: ParticipantMenuOption[] = [
    {
      i18nKey: 'participant-menu-send-message',
      action: () => {
        dispatch(
          chatConversationStateSet({
            scope: ChatScope.Private,
            targetId: participantId,
          })
        );
        dispatch(setCurrentMenuTab(MenuTab.Messages));
      },
    },

    ...subroomAudioOptions(),
  ];

  const ownMenuOptionItems: ParticipantMenuOption[] = userIsInWhisperGroup
    ? [
        {
          i18nKey: 'participant-menu-leave-whisper',
          action: () => {
            dispatch(leaveWhisperGroup.action({ whisperId: whisperGroupId }));
            closePopover();
          },
        },
      ]
    : [];

  const moderatorMenuOptionItems: ParticipantMenuOption[] = [
    ...participantMenuOptionItems,
    {
      i18nKey: 'participant-menu-remove-participant',
      action: handleRemoval,
      disabled: participant.isRoomOwner,
    },
    {
      i18nKey: 'participant-menu-move-to-waiting-room',
      action: handleMoveToWaitingRoom,
      disabled: participant.isRoomOwner,
    },
    ...moderatorRights(),
  ];

  const renderIcon = () => {
    const isHandRaised = isParticipantSelf ? ownHandRaised : participant.handIsUp;
    const isScreenShareEnabled = isParticipantSelf ? ownScreenShareEnabled : screenShareActive;
    const isAudioEnabled = isParticipantSelf ? ownAudioEnabled : audioActive;

    if (isHandRaised) {
      return (
        <RaiseHandOnIcon
          type="functional"
          title={t('handraise-icon-title')}
          titleId={uniqueId('handraise-icon-title-')}
        />
      );
    }
    if (isScreenShareEnabled) {
      return (
        <ShareScreenOnIcon
          type="functional"
          title={t('screenshare-icon-title')}
          titleId={uniqueId('screenshare-icon-title-')}
        />
      );
    }
    if (isAudioEnabled) {
      return isSipParticipant ? (
        <PhoneIcon type="functional" title={t('mic-on-icon-title')} titleId={uniqueId('mic-on-icon-title-')} />
      ) : (
        <MicOnIcon type="functional" title={t('mic-on-icon-title')} titleId={uniqueId('mic-on-icon-title-')} />
      );
    }
    return isSipParticipant ? (
      <PhoneOffIconStyled type="functional" title={t('mic-off-icon-title')} titleId={uniqueId('mic-off-icon-title-')} />
    ) : (
      <MicOffIconStyled type="functional" title={t('mic-off-icon-title')} titleId={uniqueId('mic-off-icon-title-')} />
    );
  };

  const getMenuOptions = () => {
    if (isParticipantSelf) {
      return ownMenuOptionItems;
    }
    if (isCurrentUserModerator) {
      return moderatorMenuOptionItems;
    }
    return participantMenuOptionItems;
  };

  const getContextText = () => {
    switch (sortType) {
      case SortOption.RaisedHandFirst: {
        const handUpTimestamp =
          participant && !isEmpty(participant.handUpdatedAt)
            ? new Date(participant.handUpdatedAt as string)
            : new Date();
        const formattedHandUpTime = format(handUpTimestamp, 'HH:mm');
        const joinedTimestamp =
          participant && !isEmpty(participant.joinedAt) ? new Date(participant.joinedAt as string) : new Date();
        const formattedJoinedTime = format(joinedTimestamp, 'HH:mm');
        if (participant?.handUpdatedAt && participant.handIsUp) {
          return t('participant-hand-raise-text', { handUpdated: formattedHandUpTime });
        }
        return t('participant-joined-text', { joinedTime: formattedJoinedTime });
      }
      case SortOption.LastActive: {
        const lastActiveTimestamp =
          participant && !isEmpty(participant.lastActive) ? new Date(participant.lastActive as string) : new Date();
        const formattedLastActiveTime = format(lastActiveTimestamp, 'HH:mm');
        return t('participant-last-active-text', { lastActive: formattedLastActiveTime });
      }
      default: {
        const joinedTimestamp =
          participant && !isEmpty(participant.joinedAt) ? new Date(participant.joinedAt as string) : new Date();
        const formattedJoinedTime = format(joinedTimestamp, 'HH:mm');
        return t('participant-joined-text', { joinedTime: formattedJoinedTime });
      }
    }
  };

  const isMeetingNotesEditor = (participant: Participant) => {
    if (isParticipantSelf && userMeetingNotesAccess === MeetingNotesAccess.Write) {
      return true;
    }
    if (participant.meetingNotesAccess && participant.meetingNotesAccess === MeetingNotesAccess.Write) {
      return true;
    }
    return false;
  };

  const renderAvatar = useCallback(() => {
    const isParticipantGuest = participant.participationKind === ParticipationKind.Guest;
    const isParticipantModerator = participant.role === Role.Moderator;
    const renderWithBadge = isParticipantGuest || isParticipantModerator;

    if (renderWithBadge) {
      return (
        <StyledBadge
          badgeContent={
            isParticipantGuest ? (
              t('guest-label')
            ) : (
              <ModeratorIcon
                color="primary"
                type="functional"
                title={t('moderator-icon-title')}
                titleId={uniqueId('moderator-icon-title-')}
              />
            )
          }
        >
          <Avatar src={participant?.avatarUrl} alt={participant?.displayName} isSipParticipant={isSipParticipant}>
            {participant?.displayName}
          </Avatar>
        </StyledBadge>
      );
    }

    return (
      <Avatar src={participant?.avatarUrl} alt={participant?.displayName} isSipParticipant={isSipParticipant}>
        {participant?.displayName}
      </Avatar>
    );
  }, [participant, isSipParticipant, t]);

  return (
    <ListItem style={style} isMoreMenuOpen={open} isWhispering={isWhisperActive && isParticipantSelf}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'nowrap',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <ListItemAvatar>{renderAvatar()}</ListItemAvatar>
        <ListItemText
          primary={
            <Typography
              variant="body1"
              noWrap
              translate="no"
              sx={{
                mb: 0.5,
              }}
            >
              {participant?.displayName}
              {isParticipantSelf && ` (${t('participant-list-self-description')})`}
            </Typography>
          }
          secondary={
            <Typography variant="caption" translate="no">
              {getContextText()}
            </Typography>
          }
        />

        {getMenuOptions().length > 0 && (
          <>
            <ParticipantMenuButton
              aria-label={t('participant-menu-open-label')}
              onClick={handleClick}
              aria-controls={open ? PARTICIPANT_MENU_ID : undefined}
              aria-haspopup={true}
              aria-expanded={open ? true : undefined}
            >
              <MoreIcon className="more-icon" />
            </ParticipantMenuButton>
            <ParticipantMenu
              id={PARTICIPANT_MENU_ID}
              open={open}
              setAnchorEl={setAnchorEl}
              anchorEl={anchorEl}
              options={getMenuOptions()}
            />
          </>
        )}

        <IconsContainer>
          {isMeetingNotesEditor(participant) && <MeetingNotesIcon />}
          <WhisperStateIcon state={getParticipantInviteState(participantId)} />
          {renderIcon()}
        </IconsContainer>
      </Box>
      <RenameParticipantDialog
        open={openRenameDialog}
        onClose={handleRenameParticipantDialog}
        participant={participant}
      />
      <ParticipantRemovalDialog open={openRemovalDialog} onClose={handleRemoval} participant={participant} />
    </ListItem>
  );
};

export default ParticipantListItem;
