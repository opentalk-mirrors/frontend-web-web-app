// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ListItemIcon, Typography } from '@mui/material';
import { BackendModules, RecordingFeatures, StreamingStatus } from '@opentalk/rest-api-rtk-query';
import { useTranslation } from 'react-i18next';

import { sendStartRecordingSignal, sendStopRecordingSignal } from '../../../api/types/outgoing/streaming';
import { RecordingsIcon } from '../../../assets/icons';
import { showStorageNearLimitNotification } from '../../../commonComponents/Notistack/helper';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { useStorageStatus, StorageStatus } from '../../../hooks/useStorageStatus';
import { selectAccountManagementUrl, selectIsFeatureEnabled } from '../../../store/slices/configSlice';
import { selectE2EEncryption } from '../../../store/slices/roomSlice';
import { selectIsStartRecordingRequested, selectRecordingTargetStatus } from '../../../store/slices/streamingSlice';
import { selectIsModerator } from '../../../store/slices/userSlice';
import HighSecurityTooltip from './HighSecurityTooltip';
import MoreMenuItem from './MoreMenuItem';
import StorageFullTooltip from './StorageFullTooltip';

interface RecordingMenuItemProps {
  onClose: () => void;
}

const RecordingMenuItem = ({ onClose }: RecordingMenuItemProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isModerator = useAppSelector(selectIsModerator);
  const recordingStatus = useAppSelector(selectRecordingTargetStatus);
  const accountManagementUrl = useAppSelector(selectAccountManagementUrl);
  const hasRecordingFeatureOn = useAppSelector(
    selectIsFeatureEnabled(BackendModules.Recording, RecordingFeatures.Record)
  );
  const { storageStatus, canUpgrade } = useStorageStatus();
  const highSecurityEnabled = useAppSelector(selectE2EEncryption);

  const isStartRecordingRequested = useAppSelector(selectIsStartRecordingRequested);

  const disableRecording = storageStatus === StorageStatus.Full || highSecurityEnabled || isStartRecordingRequested;

  if (!hasRecordingFeatureOn) {
    return null;
  }

  const handleStartRecording = () => {
    if (isModerator) {
      showStorageNearLimitNotification({ storageStatus, canUpgrade, accountManagementUrl });
    }
    dispatch(sendStartRecordingSignal.action());
    onClose();
  };

  switch (recordingStatus) {
    case StreamingStatus.Active:
      return (
        <MoreMenuItem
          onClick={() => {
            dispatch(sendStopRecordingSignal.action());
            onClose();
          }}
        >
          <ListItemIcon>
            <RecordingsIcon />
          </ListItemIcon>
          <Typography variant="inherit" noWrap>
            {t('more-menu-stop-recording')}
          </Typography>
        </MoreMenuItem>
      );
    case StreamingStatus.Inactive: {
      const menuItem = (
        <MoreMenuItem disabled={disableRecording} onClick={handleStartRecording}>
          <ListItemIcon>
            <RecordingsIcon />
          </ListItemIcon>
          <Typography variant="inherit" noWrap>
            {t('more-menu-start-recording')}
          </Typography>
        </MoreMenuItem>
      );
      if (storageStatus === StorageStatus.Full) {
        return (
          <StorageFullTooltip canUpgrade={canUpgrade} accountManagementUrl={accountManagementUrl}>
            {menuItem}
          </StorageFullTooltip>
        );
      }
      if (highSecurityEnabled) {
        return <HighSecurityTooltip>{menuItem}</HighSecurityTooltip>;
      }
      return menuItem;
    }
    case StreamingStatus.Requested:
      return (
        <MoreMenuItem disabled>
          <ListItemIcon>
            <RecordingsIcon disabled />
          </ListItemIcon>
          <Typography variant="inherit" noWrap>
            {t('more-menu-start-recording')}
          </Typography>
        </MoreMenuItem>
      );
    default:
      return null;
  }
};

export default RecordingMenuItem;
