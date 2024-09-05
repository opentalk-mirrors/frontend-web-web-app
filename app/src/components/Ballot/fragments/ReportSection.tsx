// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Button, FormControlLabel, Radio, RadioGroup, Stack, Typography } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { useFormik } from 'formik';
import { FC, Fragment, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { reportIssue, ReportIssueKind, VoteReportIssue } from '../../../api/types/outgoing/legalVote';
import { CommonTextField, notifications } from '../../../commonComponents';
import { useAppDispatch } from '../../../hooks';
import { LegalVoteId } from '../../../types';
import yup from '../../../utils/yupUtils';

const reportValidationScheme = yup.object({
  legal_vote_id: yup.string().uuid().required(),
  kind: yup
    .string()
    .equals([ReportIssueKind.Screenshare, ReportIssueKind.Audio, ReportIssueKind.Video, ReportIssueKind.Other])
    .optional(),
  description: yup.string().when('kind', {
    is: ReportIssueKind.Other,
    then: yup.string().maxBytes(1000).required(),
    otherwise: yup.string().maxBytes(1000).optional(),
  }),
});

type ReportSectionProps = {
  legalVoteId: string;
};

const KIND_OPTIONS = [
  ReportIssueKind.Screenshare,
  ReportIssueKind.Audio,
  ReportIssueKind.Video,
  ReportIssueKind.Other,
] as const;

const FORMIK_DEFAULTS = {
  kind: ReportIssueKind.Other,
  description: '',
};

export const ReportSection: FC<ReportSectionProps> = ({ legalVoteId }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const dispatch = useAppDispatch();
  const expandButtonReference = useRef<HTMLButtonElement>(null);

  const toggleExpandedState = () => setExpanded((expanded) => !expanded);

  const formik = useFormik<Omit<VoteReportIssue, 'action'>>({
    initialValues: {
      legal_vote_id: legalVoteId as LegalVoteId,
      ...FORMIK_DEFAULTS,
    },
    validationSchema: reportValidationScheme,
    onSubmit: (data) => {
      const payload = { ...data };
      if (payload.kind !== ReportIssueKind.Other) {
        delete payload.description;
      }
      if (payload.description) {
        delete payload.kind;
      }
      dispatch(reportIssue.action(payload));
      notifications.info(t('legal-vote-report-issue-inform-moderator-success'));
      formik.resetForm();
    },
  });

  const closeAndFocusReportButton = () => {
    setExpanded(false);
    expandButtonReference.current?.focus();
  };

  const handleCancel = () => {
    formik.resetForm();
    closeAndFocusReportButton();
  };

  useEffect(() => {
    formik.resetForm({
      values: {
        legal_vote_id: legalVoteId as LegalVoteId,
        ...FORMIK_DEFAULTS,
      },
    });
    setExpanded(false);
  }, [legalVoteId]);

  return (
    <Fragment>
      <Button
        sx={expanded ? visuallyHidden : { mt: 1 }}
        variant="text"
        onClick={toggleExpandedState}
        color="secondary"
        ref={expandButtonReference}
        tabIndex={expanded ? -1 : 0}
      >
        {t('legal-vote-report-issue-title')}
      </Button>
      {expanded && (
        <Stack component="form" onSubmit={formik.handleSubmit} mt={1}>
          <Typography id="report-technical-problem" component="h3" mb={1}>
            {t('legal-vote-report-issue-title')}
          </Typography>
          <RadioGroup
            row
            aria-labelledby="report-technical-problem"
            name="kind"
            value={formik.values.kind}
            onChange={formik.handleChange}
            sx={{ mb: 1 }}
          >
            {KIND_OPTIONS.map((value, index) => (
              <FormControlLabel
                key={value}
                value={value}
                control={
                  <Radio
                    disabled={formik.values.description !== ''}
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus={formik.values.kind === value ? true : index === 0}
                  />
                }
                label={t(value === ReportIssueKind.Other ? 'global-other' : `legal-vote-report-issue-kind-${value}`)}
              />
            ))}
          </RadioGroup>
          {formik.values.kind === ReportIssueKind.Other && (
            <>
              <CommonTextField
                fullWidth
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                label={t('global-other')}
                placeholder={t('legal-vote-report-issue-description-placeholder')}
                multiline
                maxRows={4}
                sx={{ mb: 1 }}
              />
            </>
          )}
          <Box display="flex" mt={1} gap={1}>
            <Button type="button" color="secondary" onClick={handleCancel}>
              {t('global-cancel')}
            </Button>
            <Button
              type="submit"
              color="primary"
              fullWidth
              disabled={!formik.values.description && formik.values.kind === ReportIssueKind.Other}
            >
              {t('legal-vote-report-issue-inform-moderator')}
            </Button>
          </Box>
        </Stack>
      )}
    </Fragment>
  );
};
