// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
/* eslint-disable jsx-a11y/no-autofocus */
import {
  Button,
  ButtonProps,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  IconButton,
  styled,
} from '@mui/material';
import { InviteCode, RoomId } from '@opentalk/rest-api-rtk-query';
import { useFormik } from 'formik';
import { ClipboardEvent, useState, ChangeEvent, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { validate as validateUUID } from 'uuid';

import { CloseIcon } from '../../assets/icons';
import { CommonTextField } from '../../commonComponents';
import { useIsDesktop } from '../../hooks/useMediaQuery';
import { composeRoomPath } from '../../utils/apiUtils';
import { formikProps } from '../../utils/formikUtils';
import yup from '../../utils/yupUtils';
import { MAX_CHARACTERS_ALIAS, MIN_CHARACTERS_ALIAS, VALID_ALIAS_PATTERN } from '../MeetingForms/constants';

const CloseIconButton = styled(IconButton)({
  position: 'absolute',
  top: 5,
  right: 5,
});

const isValidRoomIdentifier = (value: string) => {
  return (
    validateUUID(value) ||
    (VALID_ALIAS_PATTERN.test(value) && value.length >= MIN_CHARACTERS_ALIAS && value.length <= MAX_CHARACTERS_ALIAS)
  );
};

interface Invite {
  inviteCode: InviteCode;
  isInviteLink?: boolean;
}

interface JoinMeetingDialogProps extends Omit<DialogProps, 'open'> {
  /**
   * Props that are passed down to the button that controls when the dialog opens
   */
  openButtonProps?: ButtonProps;
}

const JoinMeetingDialog = ({ openButtonProps, ...props }: JoinMeetingDialogProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const [invite, setInvite] = useState<Invite>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const inputFieldId = t('dashboard-join-meeting-dialog-input-field');

  const validationSchema = yup.object({
    roomId: yup
      .string()
      .trim()
      .required(t('field-error-required', { fieldName: t('dashboard-join-meeting-dialog-label') }))
      .test('is valid', t('dashboard-join-meeting-dialog-invalid-id'), function (value) {
        if (value && isValidRoomIdentifier(value)) {
          return true;
        }
        return false;
      }),
  });

  const formik = useFormik({
    initialValues: { roomId: '' },
    validationSchema,
    onSubmit: (values) => {
      // If the user pasted/typed an old format invite link we treat it as such and navigate to the old invite page
      if (invite?.isInviteLink && invite.inviteCode) {
        navigate(`/invite/${invite.inviteCode}`);
      } else {
        const roomPath = composeRoomPath(values.roomId as RoomId);
        navigate(roomPath);
      }
    },
  });

  const onClose = () => {
    setIsDialogOpen(false);
    setInvite(undefined);
    formik.resetForm();
  };

  // Touch the field so the error message is shown, without triggering validation that would overwrite it.
  const showInvalidUrlError = () => {
    formik.setFieldError('roomId', t('dashboard-join-meeting-dialog-invalid-url'));
    formik.setFieldTouched('roomId', true, false);
  };

  const parseRoomId = (event: ClipboardEvent | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    event.preventDefault();
    const isClipboardEvent = 'clipboardData' in event;
    const value = isClipboardEvent ? event.clipboardData.getData('text') : event.currentTarget.value;

    if (value) {
      // Unless the user specifically typed/pasted a link from the old format (/invite/{invite_code})
      // => we assume the valid uuid code is a room id
      // We still allow modifying the code manually, we just keep the state for it (if it is an invite code or roomId)
      if (isValidRoomIdentifier(value)) {
        formik.setFieldValue('roomId', value);
        if (invite?.isInviteLink && validateUUID(value)) {
          setInvite((state) => ({ ...state, inviteCode: value as InviteCode }));
        } else {
          setInvite(undefined);
        }
        return;
      }

      try {
        const parsedURL = new URL(value);

        if (parsedURL.pathname) {
          const segments = parsedURL.pathname.split('/').filter(Boolean);

          // A room link takes precedence: the id is the segment right after `room`,
          // ignoring any trailing breakout-room-id segment kept for backwards compatibility.
          const roomIndex = segments.indexOf('room');
          const roomCode = roomIndex !== -1 ? segments[roomIndex + 1] : undefined;
          if (roomCode && isValidRoomIdentifier(roomCode)) {
            formik.setFieldValue('roomId', roomCode);
            setInvite(undefined);
            return;
          }

          // Old invite link format (`/invite/{invite_code}`) is redirected to the invite page that resolves the room.
          const inviteIndex = segments.indexOf('invite');
          if (inviteIndex !== -1) {
            const inviteCodeFromLink = segments[inviteIndex + 1];
            if (inviteCodeFromLink && validateUUID(inviteCodeFromLink)) {
              formik.setFieldValue('roomId', inviteCodeFromLink);
              setInvite({ inviteCode: inviteCodeFromLink as InviteCode, isInviteLink: true });
              return;
            }

            showInvalidUrlError();
            return;
          }
        }

        throw Error();
      } catch (_error) {
        if (isClipboardEvent || !formik.errors.roomId) {
          showInvalidUrlError();
        }
      }
    }
  };

  return (
    <>
      <Button
        fullWidth
        {...openButtonProps}
        // Props that can't be overriden
        onClick={() => setIsDialogOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={isDialogOpen}
      >
        {isDesktop ? t('dashboard-join-meeting-button') : t('dashboard-join-meeting-button-mobile')}
      </Button>
      <Dialog
        {...props}
        fullWidth
        open={isDialogOpen}
        onClose={onClose}
        aria-label={t('dashboard-join-meeting-dialog')}
        slotProps={{
          paper: {
            component: 'form',
            //eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            onSubmit: (event: FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              formik.handleSubmit(event);
            },
          },
        }}
      >
        <DialogTitle>{t('dashboard-join-meeting-dialog-title')}</DialogTitle>

        <CloseIconButton aria-label={t('dashboard-join-meeting-dialog-close-button')} onClick={onClose}>
          <CloseIcon />
        </CloseIconButton>

        <DialogContent>
          <CommonTextField
            {...formikProps('roomId', formik)}
            // Because the dialog will trap the focus and this input field is the expected starting point -
            // this is the perfect use case for an exception to the no-autofocus rule.
            autoFocus
            onBlur={parseRoomId}
            onPaste={parseRoomId}
            fullWidth
            id={inputFieldId}
            type="text"
            autoComplete="off"
            label={t('dashboard-join-meeting-dialog-label')}
          />
        </DialogContent>

        <DialogActions>
          <Button color="secondary" fullWidth={isDesktop} type="submit">
            {t('dashboard-join-meeting-dialog-join-button')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default JoinMeetingDialog;
