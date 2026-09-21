// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, MenuList, Divider as MuiDivider, Popover, Stack, Typography, styled } from '@mui/material';
import { truncate } from 'es-toolkit/compat';
import { useTranslation } from 'react-i18next';

import { ParticipantAvatar } from '../../commonComponents';
import { useAppSelector } from '../../hooks';
import { selectFullscreenElement } from '../../store/slices/fullscreen/slice';
import { hideTranscriptionSettings, selectShowSubtitlesSettings } from '../../store/slices/transcriptionSlice';
import { selectAvatarUrl, selectDisplayName, selectIsModerator } from '../../store/slices/userSlice';
import { isDevMode } from '../../utils/devMode';
import SubtitleSettingsDialog from '../Toolbar/fragments/SubtitleSettingsDialog';
import AttendanceReportMenuItem from './fragments/AttendanceReportMenuItem';
import DeleteGlobalChatMenuItem from './fragments/DeleteGlobalChatMenuItem';
import DevMenuItems from './fragments/DevMenuItems';
import RecordingMenuItem from './fragments/RecordingMenuItem';
import RemoteControlMenuItem from './fragments/RemoteControlMenuItem';
import SelfRenameMenuItem from './fragments/SelfRenameMenuItem';
import StreamingControlMenuItem from './fragments/StreamingControlMenuItem';
import { HideSubtitlesMenuItem, ShowSubtitlesMenuItem, SubtitleSettingsMenuItem } from './fragments/SubtitleMenuItems';
import ToggleChatMenuItem from './fragments/ToggleChatMenuItem';
import ToggleHandraisesMenuItem from './fragments/ToggleHandraisesMenuItem';
import ToggleMicrophonesMenuItem from './fragments/ToggleMicrophonesMenuItem';
import TogglePresenceLoggingMenuItem from './fragments/TogglePresenceLoggingMenuItem';
import ToggleReactionRestrictionsMenuItem from './fragments/ToggleReactionRestrictionsMenuItem';
import ToggleSelfRenameMenuItem from './fragments/ToggleSelfRenameMenuItem';
import ToggleWaitingRoomMenuItem from './fragments/ToggleWaitingRoomMenuItem';

interface MoreMenuProps {
  anchorEl: HTMLDivElement | null;
  onClose: () => void;
  open: boolean;
}

const MenuPopover = styled(Popover)(({ theme }) => ({
  maxWidth: '27rem',

  '& .MuiPaper-root': {
    paddingBottom: theme.spacing(2),
    paddingTop: theme.spacing(2),
  },
}));

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

const MoreMenu = ({ anchorEl, onClose, open }: MoreMenuProps) => {
  const showSubtitleSettings = useAppSelector(selectShowSubtitlesSettings);

  const { t } = useTranslation();
  const isModerator = useAppSelector(selectIsModerator);
  const displayName = useAppSelector(selectDisplayName);
  const avatarUrl = useAppSelector(selectAvatarUrl);
  const fullScreenElement = useAppSelector(selectFullscreenElement);

  return (
    <>
      <MenuPopover
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
            <MenuTitle translate="no" title={displayName}>
              {truncate(displayName, { length: 30 })}
            </MenuTitle>
          </Box>
          <small>{window.config.version?.product || t('dev-version')}</small>
        </MenuTitleContainer>
        <Divider />
        <MenuList autoFocusItem={Boolean(anchorEl)} aria-label={t('toolbar-button-more-tooltip-title')}>
          {isModerator && (
            <>
              <TogglePresenceLoggingMenuItem onClose={onClose} />
              <ToggleWaitingRoomMenuItem onClose={onClose} />
              <ToggleHandraisesMenuItem onClose={onClose} />
              <ToggleMicrophonesMenuItem onClose={onClose} />
              <ToggleSelfRenameMenuItem onClose={onClose} />
              <ToggleChatMenuItem onClose={onClose} />
              <DeleteGlobalChatMenuItem onClose={onClose} />
              <ToggleReactionRestrictionsMenuItem onClose={onClose} />
              <AttendanceReportMenuItem onClose={onClose} />
              <RecordingMenuItem onClose={onClose} />
              <SubtitleSettingsMenuItem onClose={onClose} />
              <StreamingControlMenuItem onClose={onClose} />
            </>
          )}
          <ShowSubtitlesMenuItem onClose={onClose} />
          <HideSubtitlesMenuItem onClose={onClose} />
          <RemoteControlMenuItem />
          <SelfRenameMenuItem onClose={onClose} />
          {isDevMode() && <DevMenuItems onClose={onClose} />}
        </MenuList>
      </MenuPopover>
      <SubtitleSettingsDialog open={showSubtitleSettings} onClose={() => hideTranscriptionSettings()} />
    </>
  );
};

export default MoreMenu;
