// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent as MuiDialogContent,
  DialogProps,
  DialogTitle,
  Stack,
  styled,
  Typography,
} from '@mui/material';
import { TrainingParticipationReportParameterSet } from '@opentalk/rest-api-rtk-query/src/types/event';
import { minutesToSeconds, secondsToMinutes } from 'date-fns';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';

import { CommonTextField, ErrorFormMessage } from '../../../../commonComponents';
import { formikNumberFieldProps } from '../../../../utils/formikUtils';
import yup from '../../../../utils/yupUtils';

export interface CustomTrainingParticipationReportDialogProps extends Omit<DialogProps, 'open'> {
  closeDialog: () => void;
  previousOption: TrainingParticipationReportParameterSet;
  saveOption: (option: TrainingParticipationReportParameterSet) => void;
}

const CUSTOM_TRAINING_PARTICIPATION_REPORT_DIALOG_LABEL_ID = 'custom-training-participation-report-dialog-title';

const NumberInput = styled(CommonTextField)({
  maxWidth: '4rem',
  '& input': {
    paddingRight: 0,
    textAlign: 'center',
  },
});

const DialogContent = styled(MuiDialogContent)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    minWidth: theme.typography.pxToRem(500),
  },
}));

export const CustomTrainingParticipationReportDialog = ({
  previousOption,
  closeDialog,
  saveOption,
  ...props
}: CustomTrainingParticipationReportDialogProps) => {
  const { t } = useTranslation();

  const validationSchema = yup.object({
    initialCheckpointDelay: yup.object().shape({
      from: yup.number().min(0).required(),
      to: yup.number().when('from', ([from]) => {
        return yup.number().min(from, t('dashboard-custom-training-participation-report-dialog-error', { min: from }));
      }),
    }),
    checkpointInterval: yup.object().shape({
      from: yup.number().min(1).required(),
      to: yup.number().when('from', ([from]) => {
        return yup.number().min(from, t('dashboard-custom-training-participation-report-dialog-error', { min: from }));
      }),
    }),
  });

  const convertedPreviousOption = {
    initialCheckpointDelay: {
      from: secondsToMinutes(previousOption.initialCheckpointDelay.after),
      to: secondsToMinutes(previousOption.initialCheckpointDelay.after + previousOption.initialCheckpointDelay.within),
    },
    checkpointInterval: {
      from: secondsToMinutes(previousOption.checkpointInterval.after),
      to: secondsToMinutes(previousOption.checkpointInterval.after + previousOption.checkpointInterval.within),
    },
  };

  const formik = useFormik({
    initialValues: convertedPreviousOption,
    validationSchema,
    validateOnChange: true,
    validateOnBlur: false,
    onSubmit: ({ initialCheckpointDelay, checkpointInterval }) => {
      const initialCheckpointDelayAfter = minutesToSeconds(initialCheckpointDelay.from);
      const initialCheckpointDelayWithin = minutesToSeconds(initialCheckpointDelay.to - initialCheckpointDelay.from);
      const checkpointIntervalAfter = minutesToSeconds(checkpointInterval.from);
      const checkpointIntervalWithin = minutesToSeconds(checkpointInterval.to - checkpointInterval.from);

      saveOption({
        initialCheckpointDelay: { after: initialCheckpointDelayAfter, within: initialCheckpointDelayWithin },
        checkpointInterval: { after: checkpointIntervalAfter, within: checkpointIntervalWithin },
      });

      closeDialog();
    },
  });

  const closeWithReset = () => {
    closeDialog();
    formik.resetForm();
  };

  return (
    <Dialog
      {...props}
      open
      onClose={closeWithReset}
      aria-labelledby={CUSTOM_TRAINING_PARTICIPATION_REPORT_DIALOG_LABEL_ID}
      data-testid="custom-training-participation-report-dialog"
    >
      <DialogTitle id={CUSTOM_TRAINING_PARTICIPATION_REPORT_DIALOG_LABEL_ID}>
        {t('dashboard-custom-training-participation-report-dialog-title')}
      </DialogTitle>
      <DialogContent>
        <Stack marginBottom={2}>
          <Typography>{t('dashboard-custom-training-participation-report-dialog-initial-timeout')}</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <NumberInput
              {...formikNumberFieldProps('initialCheckpointDelay.from', formik)}
              type="number"
              slotProps={{ htmlInput: { min: 0 } }}
            />
            <Typography>{t('dashboard-custom-training-participation-report-dialog-to')}</Typography>
            <NumberInput
              {...formikNumberFieldProps('initialCheckpointDelay.to', formik)}
              type="number"
              slotProps={{ htmlInput: { min: formik.values.initialCheckpointDelay.from } }}
            />
            <Typography>{t('dashboard-custom-training-participation-report-dialog-minutes')}</Typography>
          </Stack>
          {formik.errors.initialCheckpointDelay?.to && (
            <ErrorFormMessage helperText={formik.errors.initialCheckpointDelay.to} />
          )}
        </Stack>
        <Stack>
          <Typography>{t('dashboard-custom-training-participation-report-dialog-interval-duration')}</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <NumberInput
              {...formikNumberFieldProps('checkpointInterval.from', formik)}
              type="number"
              slotProps={{ htmlInput: { min: 1 } }}
            />
            <Typography>{t('dashboard-custom-training-participation-report-dialog-to')}</Typography>
            <NumberInput
              {...formikNumberFieldProps('checkpointInterval.to', formik)}
              type="number"
              slotProps={{ htmlInput: { min: formik.values.checkpointInterval.from } }}
            />
            <Typography>{t('dashboard-custom-training-participation-report-dialog-minutes')}</Typography>
          </Stack>
          {formik.errors.checkpointInterval?.to && (
            <ErrorFormMessage helperText={formik.errors.checkpointInterval.to} />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="secondary" onClick={closeWithReset}>
          {t('global-close')}
        </Button>
        <Button variant="contained" onClick={() => formik.handleSubmit()}>
          {t('global-save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
