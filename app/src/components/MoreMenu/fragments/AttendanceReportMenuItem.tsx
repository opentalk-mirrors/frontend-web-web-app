// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ListItemIcon, Typography } from '@mui/material';
import { BackendModules } from '@opentalk/rest-api-rtk-query';
import { useTranslation } from 'react-i18next';

import { generateAttendanceReport } from '../../../api/types/outgoing/meetingReport';
import { AttendanceReportIcon } from '../../../assets/icons';
import { showStorageNearLimitNotification } from '../../../commonComponents/Notistack/helper';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { useStorageStatus, StorageStatus } from '../../../hooks/useStorageStatus';
import { selectAccountManagementUrl, selectIsModuleEnabled } from '../../../store/slices/configSlice';
import { selectIsModerator } from '../../../store/slices/userSlice';
import MoreMenuItem from './MoreMenuItem';
import StorageFullTooltip from './StorageFullTooltip';

interface AttendanceReportMenuItemProps {
  onClose: () => void;
}

const AttendanceReportMenuItem = ({ onClose }: AttendanceReportMenuItemProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isMeetingReportAvailable = useAppSelector(selectIsModuleEnabled(BackendModules.MeetingReport));
  const isModerator = useAppSelector(selectIsModerator);
  const accountManagementUrl = useAppSelector(selectAccountManagementUrl);
  const { storageStatus, canUpgrade } = useStorageStatus();

  if (!isMeetingReportAvailable) {
    return null;
  }

  const menuItem = (
    <MoreMenuItem
      disabled={storageStatus === StorageStatus.Full}
      onClick={() => {
        onClose();
        if (isModerator) {
          showStorageNearLimitNotification({ storageStatus, canUpgrade, accountManagementUrl });
        }
        dispatch(generateAttendanceReport.action({ includeEmailAddresses: false }));
      }}
    >
      <ListItemIcon>
        <AttendanceReportIcon />
      </ListItemIcon>
      <Typography variant="inherit" noWrap>
        {t('more-menu-export-attendance-report')}
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

export default AttendanceReportMenuItem;
