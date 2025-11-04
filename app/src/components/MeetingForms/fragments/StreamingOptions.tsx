// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { MenuItem, Collapse as MuiCollapse, Stack, styled } from '@mui/material';
import { PlatformKind } from '@opentalk/rest-api-rtk-query';
import { FormikProps } from 'formik';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { CommonTextField } from '../../../commonComponents';
import { formikProps, formikSwitchProps } from '../../../utils/formikUtils';
import { MeetingFormValues } from './DashboardDateTimePicker';
import MeetingFormSwitch from './MeetingFormSwitch';

interface StreamingOptionsProps {
  formik: FormikProps<MeetingFormValues>;
}

const OptionsRow = styled(Stack)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: theme.spacing(5),
  '& .MuiFormControl-root': {
    flex: 1,
    maxWidth: '33%',
    '& .MuiFormHelperText-root': {
      whiteSpace: 'normal',
    },
  },
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    gap: theme.spacing(2),
    '& .MuiFormControl-root': {
      maxWidth: '100%',
    },
  },
}));

const Collapse = styled(MuiCollapse)(({ theme }) => ({
  marginBottom: theme.spacing(1),
}));

const StreamingOptions = ({ formik }: StreamingOptionsProps) => {
  const { t } = useTranslation();
  const {
    setFieldValue,
    values: {
      e2eEncryption,
      streaming: { enabled: streamingEnabled },
    },
  } = formik;

  useEffect(() => {
    if (streamingEnabled && e2eEncryption) {
      setFieldValue('streaming.enabled', false);
    }
  }, [streamingEnabled, setFieldValue, e2eEncryption]);

  return (
    <Stack
      sx={{
        gap: 2,
      }}
    >
      <MeetingFormSwitch
        checked={streamingEnabled}
        switchProps={formikSwitchProps('streaming.enabled', formik)}
        switchValueLabel={t('dashboard-meeting-livestream-switch')}
        disabled={e2eEncryption}
      />
      <Collapse orientation="vertical" in={streamingEnabled} unmountOnExit mountOnEnter>
        <OptionsRow>
          <CommonTextField
            {...formikProps('streaming.streamingTarget.kind', formik)}
            label={t('dashboard-meeting-livestream-platform-label')}
            select
            defaultValue=""
            slotProps={{
              inputLabel: {
                htmlFor: 'platform-select',
              },
              input: {
                id: 'platform-select',
              },
            }}
          >
            <MenuItem key={PlatformKind.Custom} value={PlatformKind.Custom}>
              {t('dashboard-meeting-livestream-platform-custom')}
            </MenuItem>
          </CommonTextField>
          <CommonTextField
            {...formikProps('streaming.streamingTarget.name', formik)}
            label={t('dashboard-meeting-livestream-platform-name-label')}
            placeholder={t('dashboard-meeting-livestream-platform-name-placeholder')}
          />
          <CommonTextField
            {...formikProps('streaming.streamingTarget.publicUrl', formik)}
            label={t('dashboard-meeting-livestream-public-url-label')}
            placeholder={t('global-URL-placeholder')}
          />
          <CommonTextField
            {...formikProps('streaming.streamingTarget.streamingEndpoint', formik)}
            label={t('dashboard-meeting-livestream-streaming-endpoint-label')}
            placeholder={t('dashboard-meeting-livestream-streaming-endpoint-placeholder')}
          />
          <CommonTextField
            {...formikProps('streaming.streamingTarget.streamingKey', formik)}
            label={t('dashboard-meeting-livestream-streaming-key-label')}
            placeholder={t('dashboard-meeting-livestream-streaming-key-placeholder')}
          />
        </OptionsRow>
      </Collapse>
    </Stack>
  );
};

export default StreamingOptions;
