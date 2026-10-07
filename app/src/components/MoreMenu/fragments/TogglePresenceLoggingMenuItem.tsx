// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ListItemIcon, Typography } from '@mui/material';
import { BackendModules } from '@opentalk/rest-api-rtk-query';
import { useTranslation } from 'react-i18next';

import { disablePresenceLogging, enablePresenceLogging } from '../../../api/types/outgoing/trainingParticipationReport';
import { CloseIcon, DoneIcon } from '../../../assets/icons';
import { showStorageNearLimitNotification } from '../../../commonComponents/Notistack/helper';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { useStorageStatus, StorageStatus } from '../../../hooks/useStorageStatus';
import { selectAccountManagementUrl, selectIsModuleEnabled } from '../../../store/slices/configSlice';
import { selectTrainingParticipationReportEnabled } from '../../../store/slices/moderationSlice';
import { selectIsRoomOwner } from '../../../store/slices/roomSlice';
import { selectIsModerator } from '../../../store/slices/userSlice';
import MoreMenuItem from './MoreMenuItem';
import StorageFullTooltip from './StorageFullTooltip';

interface TogglePresenceLoggingMenuItemProps {
  onClose: () => void;
}

const TogglePresenceLoggingMenuItem = ({ onClose }: TogglePresenceLoggingMenuItemProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isModerator = useAppSelector(selectIsModerator);
  const isRoomOwner = useAppSelector(selectIsRoomOwner);
  const isModuleEnabled = useAppSelector(selectIsModuleEnabled(BackendModules.TrainingParticipationReport));
  const isEnabled = useAppSelector(selectTrainingParticipationReportEnabled);
  const accountManagementUrl = useAppSelector(selectAccountManagementUrl);
  const { storageStatus, canUpgrade } = useStorageStatus();

  if (!isRoomOwner || !isModuleEnabled) {
    return null;
  }

  if (isEnabled) {
    return (
      <MoreMenuItem
        onClick={() => {
          onClose();
          dispatch(disablePresenceLogging.action());
        }}
      >
        <ListItemIcon>
          <CloseIcon />
        </ListItemIcon>
        <Typography variant="inherit" noWrap>
          {t('training-participation-logging-disable-button')}
        </Typography>
      </MoreMenuItem>
    );
  }

  const menuItem = (
    <MoreMenuItem
      disabled={storageStatus === StorageStatus.Full}
      onClick={() => {
        onClose();
        if (isModerator) {
          showStorageNearLimitNotification({ storageStatus, canUpgrade, accountManagementUrl });
        }
        dispatch(enablePresenceLogging.action({}));
      }}
    >
      <ListItemIcon>
        <DoneIcon />
      </ListItemIcon>
      <Typography variant="inherit" noWrap>
        {t('training-participation-logging-enable-button')}
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

  return menuItem;
};

export default TogglePresenceLoggingMenuItem;
