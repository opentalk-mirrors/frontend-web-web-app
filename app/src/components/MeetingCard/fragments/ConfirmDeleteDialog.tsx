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
  EventInstance,
  EventStatus,
  EventType,
  getEventId,
  isEventInstance,
} from '@opentalk/rest-api-rtk-query';
import type { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { useDeleteEventMutation, useUpdateEventInstanceMutation } from '../../../api/rest';
import { CloseIcon } from '../../../assets/icons';
import { notifications } from '../../../commonComponents';
import { EventDeletionType } from '../../../utils/eventUtils';

interface ConfirmDeleteDialogProps {
  event: Event | EventInstance;
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
  const eventId = getEventId(event);
  const [updateEventInstance, { isLoading: isSubmittingUpdateEventInstance }] = useUpdateEventInstanceMutation();
  const [deleteEvent, { isLoading: isSubmittingDeleteEvent }] = useDeleteEventMutation();
  const submitting = isSubmittingUpdateEventInstance || isSubmittingDeleteEvent;

  const stopPropagation = (mouseEvent: MouseEvent<HTMLDivElement | HTMLButtonElement | HTMLAnchorElement>) => {
    mouseEvent.stopPropagation();
  };

  const hasFetchError = (response: Awaited<ReturnType<typeof deleteEvent>>) => {
    return response.error && 'status' in response.error && response.error.status === 'FETCH_ERROR';
  };

  const deleteMeeting = async () => {
    const response = await deleteEvent(eventId);
    if (hasFetchError(response)) {
      notifications.error(t('dashboard-meeting-card-delete-offline-failure'));
    }
  };

  const deleteMeetingInstance = async (event: EventInstance) => {
    const response = await updateEventInstance({
      eventId: event.recurringEventId,
      instanceId: event.instanceId,
      status: EventStatus.Cancelled,
    });
    if (response.error && 'status' in response.error && response.error.status === 'FETCH_ERROR') {
      notifications.error(t('dashboard-meeting-card-delete-offline-failure'));
    }
  };

  const contentBasedOnEventType: ContentBasedOnEventTypeProps =
    event.type === EventType.Recurring || event.type === EventType.Instance
      ? {
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
        }
      : {
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

  const handleActionButtons = (action: EventDeletionType | null) => {
    switch (action) {
      case EventDeletionType.One: {
        if (isEventInstance(event)) {
          deleteMeetingInstance(event).finally(() => {
            onClose();
          });
        }
        break;
      }
      case EventDeletionType.All: {
        deleteMeeting().finally(() => {
          onClose();
        });
        break;
      }
      default: {
        onClose();
        break;
      }
    }
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
            loading={submitting}
          >
            {button.text}
          </Button>
        ))}
      </DialogActions>
    </Dialog>
  );
};
