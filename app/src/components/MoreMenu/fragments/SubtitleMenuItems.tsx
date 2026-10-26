// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ListItemIcon, Typography } from '@mui/material';
import { BackendModules, TranscriptionFeatures } from '@opentalk/rest-api-rtk-query';
import { useTranslation } from 'react-i18next';

import { Icon_cc_hideIcon, Icon_cc_settingsIcon, Icon_cc_showIcon } from '../../../assets/icons';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { selectIsFeatureEnabled } from '../../../store/slices/configSlice';
import { selectE2EEncryption } from '../../../store/slices/roomSlice';
import {
  hideSubtitles,
  selectIsLiveTranscriptionRunning,
  selectShowSubtitles,
  showSubtitles,
  showTranscriptionSettings,
} from '../../../store/slices/transcriptionSlice';
import { selectIsModerator } from '../../../store/slices/userSlice';
import HighSecurityTooltip from './HighSecurityTooltip';
import MoreMenuItem from './MoreMenuItem';

interface SubtitleMenuItemProps {
  onClose: () => void;
}

type SubtitleButtonState = 'hidden' | 'disabled' | 'active';

interface SubtitleButtonStateInput {
  featureAvailable: boolean;
  isModerator: boolean;
  subtitlesEnabled: boolean;
  highSecurityEnabled: boolean;
}

const getSubtitleButtonStates = ({
  featureAvailable,
  isModerator,
  subtitlesEnabled,
  highSecurityEnabled,
}: SubtitleButtonStateInput): { enableSubtitles: SubtitleButtonState; showHideSubtitles: SubtitleButtonState } => {
  if (!featureAvailable) {
    return { enableSubtitles: 'hidden', showHideSubtitles: 'hidden' };
  }

  if (highSecurityEnabled) {
    return { enableSubtitles: isModerator ? 'disabled' : 'hidden', showHideSubtitles: 'disabled' };
  }

  return {
    enableSubtitles: isModerator ? 'active' : 'hidden',
    showHideSubtitles: subtitlesEnabled ? 'active' : 'disabled',
  };
};

const useSubtitleButtonStates = () => {
  const featureAvailable = useAppSelector(
    selectIsFeatureEnabled(BackendModules.Transcription, TranscriptionFeatures.Transcription)
  );
  const isModerator = useAppSelector(selectIsModerator);
  const subtitlesEnabled = useAppSelector(selectIsLiveTranscriptionRunning);
  const highSecurityEnabled = Boolean(useAppSelector(selectE2EEncryption));
  const subtitlesShown = useAppSelector(selectShowSubtitles);

  return {
    ...getSubtitleButtonStates({ featureAvailable, isModerator, subtitlesEnabled, highSecurityEnabled }),
    subtitlesEnabled,
    subtitlesShown,
    highSecurityEnabled,
  };
};

export const SubtitleSettingsMenuItem = ({ onClose }: SubtitleMenuItemProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { enableSubtitles, subtitlesEnabled, highSecurityEnabled } = useSubtitleButtonStates();

  if (enableSubtitles === 'hidden') {
    return null;
  }

  const menuItem = (
    <MoreMenuItem
      disabled={enableSubtitles === 'disabled'}
      onClick={() => {
        onClose();
        dispatch(showTranscriptionSettings());
      }}
    >
      <ListItemIcon>
        <Icon_cc_settingsIcon />
      </ListItemIcon>
      <Typography variant="inherit" noWrap>
        {t(subtitlesEnabled ? 'more-menu-subtitle-settings' : 'more-menu-subtitle-enable')}
      </Typography>
    </MoreMenuItem>
  );

  if (highSecurityEnabled) {
    return <HighSecurityTooltip>{menuItem}</HighSecurityTooltip>;
  }

  return menuItem;
};

export const ShowSubtitlesMenuItem = ({ onClose }: SubtitleMenuItemProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { showHideSubtitles, subtitlesShown, highSecurityEnabled } = useSubtitleButtonStates();

  if (showHideSubtitles === 'hidden' || subtitlesShown) {
    return null;
  }

  const menuItem = (
    <MoreMenuItem
      onClick={() => {
        onClose();
        dispatch(showSubtitles());
      }}
      disabled={showHideSubtitles === 'disabled'}
    >
      <ListItemIcon>
        <Icon_cc_showIcon />
      </ListItemIcon>
      <Typography variant="inherit" noWrap>
        {t('more-menu-show-subtitles')}
      </Typography>
    </MoreMenuItem>
  );

  if (highSecurityEnabled) {
    return <HighSecurityTooltip>{menuItem}</HighSecurityTooltip>;
  }

  return menuItem;
};

export const HideSubtitlesMenuItem = ({ onClose }: SubtitleMenuItemProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { showHideSubtitles, subtitlesShown, highSecurityEnabled } = useSubtitleButtonStates();

  if (showHideSubtitles === 'hidden' || !subtitlesShown) {
    return null;
  }

  const menuItem = (
    <MoreMenuItem
      onClick={() => {
        onClose();
        dispatch(hideSubtitles());
      }}
      disabled={showHideSubtitles === 'disabled'}
    >
      <ListItemIcon>
        <Icon_cc_hideIcon />
      </ListItemIcon>
      <Typography variant="inherit" noWrap>
        {t('more-menu-hide-subtitles')}
      </Typography>
    </MoreMenuItem>
  );

  if (highSecurityEnabled) {
    return <HighSecurityTooltip>{menuItem}</HighSecurityTooltip>;
  }

  return menuItem;
};
