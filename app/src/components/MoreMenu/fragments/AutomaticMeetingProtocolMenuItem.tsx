// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ListItemIcon, Typography } from '@mui/material';
import { BackendModules, TranscriptionFeatures } from '@opentalk/rest-api-rtk-query';
import { useTranslation } from 'react-i18next';

import { TranscriptionStatus } from '../../../api/types/incoming/transcription';
import { sendStopAutomaticMeetingProtocolSignal } from '../../../api/types/outgoing/transcription';
import { AutomaticMeetingProtocolOnIcon, AutomaticMeetingProtocolOffIcon } from '../../../assets/icons';
import { showStorageNearLimitNotification } from '../../../commonComponents/Notistack/helper';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { useStorageStatus, StorageStatus } from '../../../hooks/useStorageStatus';
import { selectAccountManagementUrl, selectIsFeatureEnabled } from '../../../store/slices/configSlice';
import { selectE2EEncryption } from '../../../store/slices/roomSlice';
import {
  selectIsAutomaticMeetingProtocolRunning,
  selectTranscriptionStatus,
} from '../../../store/slices/transcriptionSlice';
import HighSecurityTooltip from './HighSecurityTooltip';
import MoreMenuItem from './MoreMenuItem';
import StorageFullTooltip from './StorageFullTooltip';

interface AutomaticMeetingProtocolMenuItemProps {
  onClose: () => void;
  onStart: () => void;
}

const AutomaticMeetingProtocolMenuItem = ({ onClose, onStart }: AutomaticMeetingProtocolMenuItemProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const accountManagementUrl = useAppSelector(selectAccountManagementUrl);
  const hasTranscriptionFeatureOn = useAppSelector(
    selectIsFeatureEnabled(BackendModules.Transcription, TranscriptionFeatures.Transcription)
  );
  const { storageStatus, canUpgrade } = useStorageStatus();
  const isHighSecurityEnabled = useAppSelector(selectE2EEncryption);
  const isAutomaticMeetingProtocolRunning = useAppSelector(selectIsAutomaticMeetingProtocolRunning);
  const transcriptionStatus = useAppSelector(selectTranscriptionStatus);
  const isDisabledDueToStorage = storageStatus === StorageStatus.Critical || storageStatus === StorageStatus.Full;
  const isStartDisabled =
    isDisabledDueToStorage || isHighSecurityEnabled || transcriptionStatus === TranscriptionStatus.Requested;

  if (!hasTranscriptionFeatureOn) {
    return null;
  }

  const startMenuItem = (
    <MoreMenuItem
      onClick={() => {
        showStorageNearLimitNotification({ storageStatus, canUpgrade, accountManagementUrl });
        onStart();
        onClose();
      }}
      disabled={isStartDisabled}
    >
      <ListItemIcon>
        <AutomaticMeetingProtocolOnIcon />
      </ListItemIcon>
      <Typography variant="inherit" noWrap>
        {t('more-menu-start-automatic-meeting-protocol')}
      </Typography>
    </MoreMenuItem>
  );

  const stopMenuItem = (
    <MoreMenuItem
      onClick={() => {
        dispatch(sendStopAutomaticMeetingProtocolSignal.action());
        onClose();
      }}
    >
      <ListItemIcon>
        <AutomaticMeetingProtocolOffIcon />
      </ListItemIcon>
      <Typography variant="inherit" noWrap>
        {t('more-menu-stop-automatic-meeting-protocol')}
      </Typography>
    </MoreMenuItem>
  );

  if (isAutomaticMeetingProtocolRunning) {
    return stopMenuItem;
  } else {
    if (isDisabledDueToStorage) {
      return (
        <StorageFullTooltip canUpgrade={canUpgrade} accountManagementUrl={accountManagementUrl}>
          {startMenuItem}
        </StorageFullTooltip>
      );
    }
    if (isHighSecurityEnabled) {
      return <HighSecurityTooltip>{startMenuItem}</HighSecurityTooltip>;
    }
    return startMenuItem;
  }
};

export default AutomaticMeetingProtocolMenuItem;
