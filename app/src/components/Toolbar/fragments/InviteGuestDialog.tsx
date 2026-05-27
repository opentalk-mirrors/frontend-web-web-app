// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import DateFnsAdapter from '@date-io/date-fns';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  IconButton as MuiIconButton,
  Stack,
  styled,
  Typography,
} from '@mui/material';
import { DateTime, RoomId } from '@opentalk/rest-api-rtk-query';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import { useCreateRoomInviteMutation } from '../../../api/rest';
import { CloseIcon } from '../../../assets/icons';
import { notifications } from '../../../commonComponents';
import { useAppSelector } from '../../../hooks';
import { selectBaseUrl } from '../../../store/slices/configSlice';
import { selectRoomId } from '../../../store/slices/roomSlice';
import { composeInviteUrl } from '../../../utils/apiUtils';
import { formikDateTimePickerProps } from '../../../utils/formikUtils';
import DateTimePicker from '../../DateTimePicker';

const IconButton = styled(MuiIconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
}));

const InviteGuestDialog = (props: Omit<DialogProps, 'children'>) => {
  const dateFns = new DateFnsAdapter();
  const { t } = useTranslation();
  const baseUrl = useAppSelector(selectBaseUrl);
  const roomId = useAppSelector(selectRoomId);
  const [createGuestLink, { data, reset, isSuccess }] = useCreateRoomInviteMutation();
  const inviteUrl = isSuccess && data && roomId ? composeInviteUrl(baseUrl, roomId, data.inviteCode) : null;

  const endOfToday = dateFns.endOfDay(new Date());
  const minTimeDate = dateFns.addMinutes(new Date(), 5);

  const validationSchema = yup.object({
    expirationDate: yup.date().nullable().min(minTimeDate, t('dialog-invite-guest-expiration-date-error')),
  });

  const formik = useFormik({
    initialValues: {
      expirationDate: endOfToday,
    },
    validationSchema,
    onSubmit: (values) => submit(values.expirationDate),
  });

  const resetValues = () => {
    reset();
    formik.resetForm();
  };

  const onClose = () => {
    props.onClose?.({}, 'escapeKeyDown');
    resetValues();
  };

  const submit = async (expirationDate: Date | null) => {
    const id = roomId as unknown;

    createGuestLink({
      id: id as RoomId,
      expiration: expirationDate ? (expirationDate.toISOString() as DateTime) : undefined,
    })
      .unwrap()
      .catch(() => {
        notifications.error(t('global-copy-permanent-guest-link-error'));
      });
  };

  const onChangeExpirationDate = (expirationDate: Date | null) => {
    formik.setFieldValue('expirationDate', expirationDate);
  };

  const copyToClipboard = async () => {
    if (inviteUrl) {
      await navigator.clipboard.writeText(inviteUrl.toString());
      notifications.success(t('global-copy-link-success'));
      onClose();
    } else {
      notifications.error(t('global-copy-permanent-guest-link-error'));
    }
  };

  return (
    <Dialog {...props} fullWidth onClose={onClose}>
      <DialogTitle variant="body1">{t('dialog-invite-guest-title')}</DialogTitle>
      <IconButton aria-label={t('global-close-dialog')} onClick={onClose}>
        <CloseIcon />
      </IconButton>
      {inviteUrl ? (
        <Stack>
          <DialogContent>
            <Typography gutterBottom>{inviteUrl.toString()}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={copyToClipboard} color="secondary">
              {t('dialog-invite-guest-button-copy')}
            </Button>
          </DialogActions>
        </Stack>
      ) : (
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <DateTimePicker
              {...formikDateTimePickerProps('expirationDate', {
                ...formik,
                handleChange: onChangeExpirationDate as never,
              })}
              ampm={false}
              value={formik.values.expirationDate ? formik.values.expirationDate.toString() : ''}
              clearable
              clearButtonLabel={t('dialog-invite-guest-no-expiration')}
              minTimeDate={minTimeDate}
              textField={{
                placeholder: t('dialog-invite-guest-no-expiration'),
                startAdornment: t('dialog-invite-guest-expiration-date'),
                fullWidth: true,
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button type="submit" color="secondary">
              {t('dialog-invite-guest-button-submit')}
            </Button>
          </DialogActions>
        </form>
      )}
    </Dialog>
  );
};

export default InviteGuestDialog;
