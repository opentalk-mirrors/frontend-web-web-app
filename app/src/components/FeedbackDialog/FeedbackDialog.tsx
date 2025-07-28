// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  Dialog,
  DialogProps,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import i18n from 'i18next';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import { sendFeedback } from '../../api/rest';
import { Rating, CommonTextField, notifications } from '../../commonComponents';
import { useAppDispatch } from '../../hooks';
import browser from '../../modules/BrowserSupport';
import { formikProps, formikRatingProps } from '../../utils/formikUtils';

interface FeedbackDialogProps extends DialogProps {
  onClose?: () => void;
  onSubmit?: () => void;
}

const FeedbackDialog = (props: FeedbackDialogProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const browserData = browser.browserData();

  const feedbackSchema = yup.object({
    functionRangeRating: yup.string().trim().required(t('feedback-dialog-form-validation')),
    handlingRating: yup.string().trim().required(t('feedback-dialog-form-validation')),
    videoQualityRating: yup.string().trim().required(t('feedback-dialog-form-validation')),
    audioQualityRating: yup.string().trim().required(t('feedback-dialog-form-validation')),
  });

  const formik = useFormik({
    initialValues: {
      functionRangeRating: '',
      handlingRating: '',
      videoQualityRating: '',
      audioQualityRating: '',
      likedText: '',
      problemsText: '',
      criticText: '',
    },
    validationSchema: feedbackSchema,
    onSubmit: async (values) => {
      dispatch(
        sendFeedback({
          lang: i18n.language,
          browser: browserData,
          form: [
            {
              name: 'functionRangeRating',
              value: values.functionRangeRating,
              type: 'rating',
            },
            {
              name: 'handlingRating',
              value: values.handlingRating,
              type: 'rating',
            },
            {
              name: 'videoQualityRating',
              value: values.videoQualityRating,
              type: 'rating',
            },
            {
              name: 'audioQualityRating',
              value: values.audioQualityRating,
              type: 'rating',
            },
            {
              name: 'likedText',
              value: values.likedText,
              type: 'text',
            },
            {
              name: 'problemsText',
              value: values.problemsText,
              type: 'text',
            },
            {
              name: 'criticText',
              value: values.criticText,
              type: 'text',
            },
          ],
        })
      );
      props.onClose && props.onClose();
      notifications.success(t('feedback-dialog-submit-success'));
      formik.resetForm();
    },
    validateOnChange: false,
  });

  const sendButtonEnabled = useMemo(() => {
    return feedbackSchema.isValidSync({
      audioQualityRating: formik.values.audioQualityRating,
      functionRangeRating: formik.values.functionRangeRating,
      videoQualityRating: formik.values.videoQualityRating,
      handlingRating: formik.values.handlingRating,
    });
  }, [formik.values, feedbackSchema]);

  return (
    <Dialog {...props} fullWidth maxWidth="md" aria-labelledby="feedback-dialog">
      <DialogTitle>{t('feedback-dialog-title')}</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Stack spacing={2}>
            <Typography color="inherit">{t('feedback-dialog-headline')}</Typography>
            <Rating
              {...formikRatingProps('functionRangeRating', formik)}
              label={t('feedback-dialog-rating-function-range')}
            />
            <Rating {...formikRatingProps('handlingRating', formik)} label={t('feedback-dialog-rating-handling')} />
            <Rating
              {...formikRatingProps('videoQualityRating', formik)}
              label={t('feedback-dialog-rating-video-quality')}
            />
            <Rating
              {...formikRatingProps('audioQualityRating', formik)}
              label={t('feedback-dialog-rating-audio-quality')}
            />
            <CommonTextField
              {...formikProps('likedText', formik)}
              fullWidth
              multiline
              minRows={4}
              maxRows={4}
              label={t('feedback-dialog-label-liked')}
              placeholder={t('feedback-dialog-description-placeholder')}
            />
            <CommonTextField
              {...formikProps('problemsText', formik)}
              fullWidth
              multiline
              minRows={4}
              maxRows={4}
              label={t('feedback-dialog-label-problems')}
              placeholder={t('feedback-dialog-description-placeholder')}
            />
            <CommonTextField
              {...formikProps('criticText', formik)}
              fullWidth
              multiline
              minRows={4}
              maxRows={4}
              label={t('feedback-dialog-label-critic')}
              placeholder={t('feedback-dialog-description-placeholder')}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onClose} variant="text" color="inherit">
            {t('feedback-button-close')}
          </Button>
          <Button disabled={!sendButtonEnabled} type="submit" color="secondary">
            {t('feedback-button-submit')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default FeedbackDialog;
