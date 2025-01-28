// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2

/* eslint-disable jsx-a11y/no-autofocus */
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, IconButton, styled } from '@mui/material';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';

import { changeDisplayName } from '../../../api/types/outgoing/moderation';
import { CloseIcon } from '../../../assets/icons';
import { CommonTextField } from '../../../commonComponents';
import { useAppDispatch } from '../../../hooks';
import { Participant } from '../../../types';
import { formikProps } from '../../../utils/formikUtils';
import yup from '../../../utils/yupUtils';

const CloseIconButton = styled(IconButton)({
  position: 'absolute',
  right: 8,
  top: 8,
});

interface RenameParticipantDialogProps {
  open: boolean;
  participant: Participant;
  onClose: () => void;
}

const RenameParticipantDialog = ({ open, onClose, participant }: RenameParticipantDialogProps) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const validationSchema = yup.object({
    name: yup
      .string()
      .trim()
      .max(100, t('display-name-character-limit-error', { limit: 100 }))
      .required(t('field-error-required', { fieldName: t('participant-menu-rename-new-name') })),
  });

  const formik = useFormik({
    initialValues: { name: '' },
    validateOnBlur: false,
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      dispatch(changeDisplayName.action({ target: participant.id, newName: values.name }));
      resetForm();
      handleClose();
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperComponent={Paper}
      fullWidth
      slotProps={{
        paper: {
          component: 'form',
          // component: 'form' is not changing the element type (the elements is still considered a div instead of a form) so we ts-ignore it.
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            formik.handleSubmit(event);
          },
        },
      }}
    >
      <DialogTitle>{t('participant-menu-rename')}</DialogTitle>
      <CloseIconButton aria-label={t('global-close-dialog')} onClick={handleClose}>
        <CloseIcon />
      </CloseIconButton>
      <DialogContent>
        <CommonTextField
          {...formikProps('name', formik)}
          autoFocus
          name="name"
          placeholder={t('global-name-placeholder')}
          label={t('participant-menu-rename-new-name')}
          type="text"
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button type="submit">{t('global-save')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RenameParticipantDialog;
