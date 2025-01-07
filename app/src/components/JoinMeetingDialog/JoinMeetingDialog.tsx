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
  InputLabel,
  styled,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
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

const CloseIconButton = styled(IconButton)({
  position: 'absolute',
  top: 0,
  right: 0,
});

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
        if (value && validateUUID(value)) {
          return true;
        }
        return false;
      }),
  });

  const formik = useFormik({
    initialValues: { roomId: '' },
    validationSchema,
    onSubmit: (values) => {
      //If the user pasted/typed an old format invite link we treat it as such and navigate to the old invite page
      if (invite?.isInviteLink && invite.inviteCode) {
        navigate(`/invite/${invite.inviteCode}`);
      } else {
        const roomPath = composeRoomPath(values.roomId as RoomId, invite?.inviteCode);
        navigate(roomPath);
      }
    },
  });

  const onClose = () => {
    setIsDialogOpen(false);
    setInvite(undefined);
    formik.resetForm();
  };

  const parseRoomId = (event: ClipboardEvent | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    event.preventDefault();
    const isClipboardEvent = 'clipboardData' in event;
    const value = isClipboardEvent ? event.clipboardData.getData('text') : event.currentTarget.value;

    if (value) {
      //Unless the user specifically typed/pasted a link from the old format (/invite/{invite_code})
      //=> we assume the valid uuid code is a room id
      //We still allow modifying the code manually, we just keep the state for it (if it is an invite code or roomId)
      if (validateUUID(value)) {
        formik.setFieldValue('roomId', value);
        if (invite?.isInviteLink) {
          setInvite((state) => ({ ...state, inviteCode: value as InviteCode }));
        }
        return;
      }

      try {
        const parsedURL = new URL(value);

        if (parsedURL.pathname) {
          //If the user pastes/types a link containing `/invite/` (old invite link format)
          //=> we use that link for redirecting to the old invite page that resolves the room
          if (parsedURL.pathname.includes('/invite/')) {
            const inviteCodeFromLink = parsedURL.pathname.replace('/invite/', '');
            const isValidFormat = validateUUID(inviteCodeFromLink);

            if (isValidFormat) {
              formik.setFieldValue('roomId', inviteCodeFromLink);
              setInvite({ inviteCode: inviteCodeFromLink as InviteCode, isInviteLink: true });
              return;
            }

            formik.setFieldError('roomId', t('dashboard-join-meeting-dialog-invalid-url'));
            return;
          }

          const roomCode = parsedURL.pathname.replace('/room/', '');
          const isValidFormat = validateUUID(roomCode);

          if (isValidFormat) {
            formik.setFieldValue('roomId', roomCode);

            const parsedInviteCode = parsedURL.searchParams.get('invite');
            const isInviteCodeValidFormat = parsedInviteCode && validateUUID(parsedInviteCode);
            if (isInviteCodeValidFormat) {
              setInvite({ inviteCode: parsedInviteCode as InviteCode, isInviteLink: false });
              return;
            }
          }
        }

        throw Error;
      } catch (error) {
        if (isClipboardEvent || !formik.errors.roomId) {
          formik.setFieldError('roomId', t('dashboard-join-meeting-dialog-invalid-url'));
        }
      }
    }
  };

  return (
    <>
      <Button
        color="secondary"
        fullWidth
        {...openButtonProps}
        //Props that can't be overriden
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
        PaperProps={{
          component: 'form',
          //eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          onSubmit: (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            formik.handleSubmit(event);
          },
        }}
      >
        <DialogTitle>{t('dashboard-join-meeting-dialog-title')}</DialogTitle>

        <CloseIconButton aria-label={t('dashboard-join-meeting-dialog-close-button')} onClick={onClose}>
          <CloseIcon />
        </CloseIconButton>

        <DialogContent>
          {/* Added visually hidden label to prevent placeholder being read when there is a value */}
          <InputLabel htmlFor={inputFieldId} sx={visuallyHidden}>
            {t('dashboard-join-meeting-dialog-input-field')}
          </InputLabel>
          <CommonTextField
            {...formikProps('roomId', formik)}
            //Because the dialog will trap the focus and this input field is the expected starting point -
            //this is the perfect use case for an exception to the no-autofocus rule.
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
          <Button color="primary" fullWidth={isDesktop} type="submit">
            {t('dashboard-join-meeting-dialog-join-button')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default JoinMeetingDialog;
