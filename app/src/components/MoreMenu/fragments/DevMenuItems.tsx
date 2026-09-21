// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ListItemIcon, Typography } from '@mui/material';
import { BackendModules } from '@opentalk/rest-api-rtk-query';

import { disablePresenceLogging, enablePresenceLogging } from '../../../api/types/outgoing/trainingParticipationReport';
import { ErrorIcon, CloseIcon } from '../../../assets/icons';
import { notificationAction, notificationPersistent, notifications } from '../../../commonComponents';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { selectIsModuleEnabled } from '../../../store/slices/configSlice';
import { selectTrainingParticipationReportEnabled } from '../../../store/slices/moderationSlice';
import MoreMenuItem from './MoreMenuItem';

interface DevMenuItemsProps {
  onClose: () => void;
}

interface DevMenuEntry {
  label: string;
  action: () => void;
  icon: React.ReactNode;
}

const DevMenuItems = ({ onClose }: DevMenuItemsProps) => {
  const dispatch = useAppDispatch();
  const isTrainingParticipationReportModuleOn = useAppSelector(
    selectIsModuleEnabled(BackendModules.TrainingParticipationReport)
  );
  const isTrainingParticipationReportEnabled = useAppSelector(selectTrainingParticipationReportEnabled);

  const entries: Array<DevMenuEntry> = [
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

  if (isTrainingParticipationReportModuleOn) {
    entries.push(
      isTrainingParticipationReportEnabled
        ? {
            label: 'Test training participation report off',
            action: () => {
              onClose();
              dispatch(disablePresenceLogging.action());
            },
            icon: <CloseIcon />,
          }
        : {
            label: 'Test training participation report on',
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
          }
    );
  }

  return entries.map(({ label, action, icon }) => (
    <MoreMenuItem key={label} onClick={action}>
      <ListItemIcon>{icon}</ListItemIcon>
      <Typography variant="inherit" noWrap>
        {label}
      </Typography>
    </MoreMenuItem>
  ));
};

export default DevMenuItems;
