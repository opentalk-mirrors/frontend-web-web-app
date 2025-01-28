// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  Box,
  Button,
  ButtonTypeMap,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import {
  Event,
  EventException,
  EventId,
  EventStatus,
  EventType,
  RecurringEvent,
  isRecurringEvent,
} from '@opentalk/rest-api-rtk-query';
import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import {
  useDeleteEventMutation,
  useDeleteEventSharedFolderMutation,
  useUpdateEventInstanceMutation,
} from '../../../api/rest';
import { CloseIcon } from '../../../assets/icons';
import { notificationAction, notifications } from '../../../commonComponents';
import { EventDeletionType, generateInstanceId } from '../../../utils/eventUtils';

interface ConfirmDeleteDialogProps {
  event: Event | EventException;
  open: boolean;
  onClose: () => void;
}

type ColorTypeMap<P = unknown> = ButtonTypeMap<P>['props']['color'];

interface ContentBasedOnEventTypeProps {
  message: string;
  title: string;
  actionButtons: {
    text: string;
    action: EventDeletionType | null;
    color: ColorTypeMap;
  }[];
}

const DIALOG_DESCRIPTION_ID = 'dashboard-confirm-delete-dialog-description-id';
const DIALOG_TITLE_ID = 'dashboard-confirm-delete-dialog-label-id';

export const ConfirmDeleteDialog = (props: ConfirmDeleteDialogProps) => {
  const { t } = useTranslation();
  const { open, event, onClose } = props;
  const { title } = event;
  const eventId = event.id as EventId;
  const [deleteSharedFolder] = useDeleteEventSharedFolderMutation();
  const [updateEventInstance] = useUpdateEventInstanceMutation();
  const [deleteEvent] = useDeleteEventMutation();
  const isFirstTryToDeleteSharedFolder = useRef(true);

  const stopPropagation = (mouseEvent: React.MouseEvent<HTMLDivElement | HTMLButtonElement | HTMLAnchorElement>) => {
    mouseEvent.stopPropagation();
  };

  const handleDeleteSharedFolder = async () => {
    if ('sharedFolder' in event) {
      try {
        await deleteSharedFolder({ eventId, forceDeletion: false }).unwrap();
      } catch (error) {
        if (isFirstTryToDeleteSharedFolder.current) {
          onClose();
          notificationAction({
            msg: t('dashboard-meeting-shared-folder-delete-error-message'),
            variant: 'error',
            actionBtnText: t('dashboard-meeting-shared-folder-error-retry-button'),
            cancelBtnText: t('dashboard-meeting-shared-folder-error-cancel-button'),
            persist: true,
            onAction: () => {
              isFirstTryToDeleteSharedFolder.current = false;
              deleteMeeting();
            },
            onCancel: () => {
              isFirstTryToDeleteSharedFolder.current = true;
              onClose();
            },
          });
          return;
        } else {
          isFirstTryToDeleteSharedFolder.current = true;
          notifications.error(t('dashboard-meeting-shared-folder-delete-retry-error-message'));
          return;
        }
      }
    }
  };

  const hasFetchError = (response: Awaited<ReturnType<typeof deleteEvent>>) => {
    return 'error' in response && 'status' in response.error && response.error.status === 'FETCH_ERROR';
  };

  const deleteMeeting = async () => {
    await handleDeleteSharedFolder();
    const response = await deleteEvent(eventId);
    if (hasFetchError(response)) {
      notifications.error(t('dashboard-meeting-card-delete-offline-failure'));
    }
  };

  const deleteMeetingInstance = async (event: RecurringEvent) => {
    const response = await updateEventInstance({
      eventId: event.id,
      instanceId: generateInstanceId(event.startsAt),
      status: EventStatus.Cancelled,
    });
    if ('error' in response && 'status' in response.error && response.error.status === 'FETCH_ERROR') {
      notifications.error(t('dashboard-meeting-card-delete-offline-failure'));
    }
  };

  const contentBasedOnEventType: ContentBasedOnEventTypeProps = useMemo(() => {
    switch (event.type) {
      case EventType.Recurring:
        return {
          message: t('dashboard-recurrence-meeting-card-delete-dialog-message'),
          title: t('dashboard-meeting-card-delete-dialog-title'),
          actionButtons: [
            {
              text: t('dashboard-meeting-card-delete-dialog-cancel'),
              action: null,
              color: 'primary',
            },
            {
              text: t('dashboard-recurrence-meeting-card-delete-dialog-one'),
              action: EventDeletionType.One,
              color: 'secondary',
            },
            {
              text: t('dashboard-recurrence-meeting-card-delete-dialog-all'),
              action: EventDeletionType.All,
              color: 'secondary',
            },
          ],
        };
      default:
        return {
          message: t('dashboard-meeting-card-delete-dialog-message', {
            subject: title,
          }),
          title: t('dashboard-meeting-card-delete-dialog-title'),
          actionButtons: [
            {
              text: t('dashboard-meeting-card-delete-dialog-cancel'),
              action: null,
              color: 'primary',
            },
            {
              text: t('dashboard-meeting-card-delete-dialog-ok'),
              action: EventDeletionType.All,
              color: 'secondary',
            },
          ],
        };
    }
  }, [event]);

  const handleActionButtons = async (action: EventDeletionType | null) => {
    switch (action) {
      case EventDeletionType.One:
        if (isRecurringEvent(event)) {
          await deleteMeetingInstance(event);
        }
        break;
      case EventDeletionType.All:
        await deleteMeeting();
        break;
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      onMouseDown={stopPropagation}
      onClose={onClose}
      aria-describedby={DIALOG_DESCRIPTION_ID}
      aria-labelledby={DIALOG_TITLE_ID}
      role="dialog"
    >
      <DialogTitle id={DIALOG_TITLE_ID} aria-hidden="true" sx={{ textAlign: 'left' }}>
        {contentBasedOnEventType.title}
      </DialogTitle>
      <Box
        sx={{
          position: 'absolute',
          top: 5,
          right: 5,
        }}
      >
        <IconButton aria-label={t('global-close-dialog')} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogContent style={{ textAlign: 'left' }}>
        <Typography>{contentBasedOnEventType?.message}</Typography>
      </DialogContent>
      <DialogActions>
        {contentBasedOnEventType.actionButtons.map((button, index) => (
          <Button
            onClick={() => handleActionButtons(button.action)}
            color={button.color}
            variant="contained"
            key={`${button.text}-${index}`}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus={index === 0}
          >
            {button.text}
          </Button>
        ))}
      </DialogActions>
    </Dialog>
  );
};
