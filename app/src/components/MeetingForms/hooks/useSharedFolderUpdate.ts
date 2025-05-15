// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Event } from '@opentalk/rest-api-rtk-query';
import { FormikValues } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useCreateEventSharedFolderMutation, useDeleteEventSharedFolderMutation } from '../../../api/rest';
import { notifications, notificationAction } from '../../../commonComponents';

export const useSharedFolderUpdate = () => {
  const { t } = useTranslation();
  const [isFirstTryToCreateSharedFolder, setIsFirstTryToCreateSharedFolder] = useState(true);
  const [isFirstTryToDeleteSharedFolder, setIsFirstTryToDeleteSharedFolder] = useState(true);
  const [createSharedFolder] = useCreateEventSharedFolderMutation();
  const [deleteSharedFolder] = useDeleteEventSharedFolderMutation();

  const handleUpdateSharedFolder = async (event: Event, values: FormikValues, formikHandleSubmit: () => void) => {
    if (!event.sharedFolder && values.sharedFolder) {
      return handleCreateSharedFolder(event, values, formikHandleSubmit);
    }
    if (event.sharedFolder && !values.sharedFolder) {
      return handleDeleteSharedFolder(event, values, formikHandleSubmit);
    }
    return true;
  };

  const handleCreateSharedFolder = async (event: Event, values: FormikValues, formikHandleSubmit: () => void) => {
    if (isFirstTryToCreateSharedFolder) {
      try {
        setIsFirstTryToCreateSharedFolder(false);
        await createSharedFolder({ eventId: event.id }).unwrap();
      } catch (_err) {
        notificationAction({
          msg: t('dashboard-meeting-shared-folder-create-error-message'),
          variant: 'error',
          ariaLive: 'assertive',
          actionBtnText: t('dashboard-meeting-shared-folder-error-retry-button'),
          cancelBtnText: t('dashboard-meeting-shared-folder-error-cancel-button'),
          persist: true,
          onAction: () => {
            formikHandleSubmit();
          },
          onCancel: () => {
            values.sharedFolder = false;
            setIsFirstTryToCreateSharedFolder(true);
          },
        });
        return false;
      }
    } else {
      try {
        await createSharedFolder({ eventId: event.id }).unwrap();
      } catch (_err) {
        values.sharedFolder = false;
        notifications.error(t('dashboard-meeting-shared-folder-create-retry-error-message'));
        setIsFirstTryToCreateSharedFolder(true);
        return true;
      }
    }
    return true;
  };

  const handleDeleteSharedFolder = async (event: Event, values: FormikValues, formikHandleSubmit: () => void) => {
    if (isFirstTryToDeleteSharedFolder) {
      try {
        setIsFirstTryToDeleteSharedFolder(false);
        await deleteSharedFolder({ eventId: event.id, forceDeletion: false }).unwrap();
      } catch (_err) {
        notificationAction({
          msg: t('dashboard-meeting-shared-folder-delete-error-message'),
          variant: 'error',
          ariaLive: 'assertive',
          actionBtnText: t('dashboard-meeting-shared-folder-error-retry-button'),
          cancelBtnText: t('dashboard-meeting-shared-folder-error-cancel-button'),
          persist: true,
          onAction: () => {
            formikHandleSubmit();
          },
          onCancel: () => {
            values.sharedFolder = true;
            setIsFirstTryToDeleteSharedFolder(true);
          },
        });
        return false;
      }
    } else {
      try {
        await deleteSharedFolder({ eventId: event.id, forceDeletion: false }).unwrap();
      } catch (_err) {
        values.sharedFolder = true;
        notifications.error(t('dashboard-meeting-shared-folder-delete-retry-error-message'));
        setIsFirstTryToDeleteSharedFolder(true);
        return true;
      }
    }
    return true;
  };

  return { handleUpdateSharedFolder };
};
