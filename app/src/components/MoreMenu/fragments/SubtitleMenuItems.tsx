// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ListItemIcon, Typography } from '@mui/material';
import { BackendModules, TranscriptionFeatures } from '@opentalk/rest-api-rtk-query';
import { useTranslation } from 'react-i18next';

import { TranscriptionStatus } from '../../../api/types/incoming/transcription';
import { Icon_cc_hideIcon, Icon_cc_settingsIcon, Icon_cc_showIcon } from '../../../assets/icons';
import { notifications } from '../../../commonComponents';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { selectIsFeatureEnabled } from '../../../store/slices/configSlice';
import { selectE2EEncryption } from '../../../store/slices/roomSlice';
import {
  hideSubtitles,
  selectShowSubtitles,
  selectTranscriptionStatus,
  showSubtitles,
  showTranscriptionSettings,
} from '../../../store/slices/transcriptionSlice';
import HighSecurityTooltip from './HighSecurityTooltip';
import MoreMenuItem from './MoreMenuItem';

interface SubtitleMenuItemProps {
  onClose: () => void;
}

const useSubtitleFeatureEnabled = () =>
  useAppSelector(selectIsFeatureEnabled(BackendModules.Transcription, TranscriptionFeatures.Transcription));

export const SubtitleSettingsMenuItem = ({ onClose }: SubtitleMenuItemProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const featureEnabled = useSubtitleFeatureEnabled();
  const transcriptionStatus = useAppSelector(selectTranscriptionStatus);
  const highSecurityEnabled = useAppSelector(selectE2EEncryption);

  if (!featureEnabled) {
    return null;
  }

  const subtitlesEnabled = transcriptionStatus === TranscriptionStatus.Running;

  const menuItem = (
    <MoreMenuItem
      disabled={highSecurityEnabled}
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
  const featureEnabled = useSubtitleFeatureEnabled();
  const showSubtitlesOn = useAppSelector(selectShowSubtitles);
  const transcriptionStatus = useAppSelector(selectTranscriptionStatus);

  if (!featureEnabled || showSubtitlesOn) {
    return null;
  }

  return (
    <MoreMenuItem
      onClick={() => {
        onClose();
        if (transcriptionStatus === TranscriptionStatus.Inactive) {
          notifications.warning(t('subtitle-notification-not-enabled-warning'));
        }
        dispatch(showSubtitles());
      }}
      disabled={transcriptionStatus !== TranscriptionStatus.Running}
    >
      <ListItemIcon>
        <Icon_cc_showIcon />
      </ListItemIcon>
      <Typography variant="inherit" noWrap>
        {t('more-menu-show-subtitles')}
      </Typography>
    </MoreMenuItem>
  );
};

export const HideSubtitlesMenuItem = ({ onClose }: SubtitleMenuItemProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const featureEnabled = useSubtitleFeatureEnabled();
  const showSubtitlesOn = useAppSelector(selectShowSubtitles);

  if (!featureEnabled || !showSubtitlesOn) {
    return null;
  }

  return (
    <MoreMenuItem
      onClick={() => {
        onClose();
        dispatch(hideSubtitles());
      }}
    >
      <ListItemIcon>
        <Icon_cc_hideIcon />
      </ListItemIcon>
      <Typography variant="inherit" noWrap>
        {t('more-menu-hide-subtitles')}
      </Typography>
    </MoreMenuItem>
  );
};
