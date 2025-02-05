// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Collapse as MuiCollapse, MenuItem, Stack, styled } from '@mui/material';
import { PlatformKind } from '@opentalk/rest-api-rtk-query';
import { FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';

import { CommonTextField } from '../../../commonComponents';
import { formikMinimalProps, formikProps } from '../../../utils/formikUtils';
import { CreateOrUpdateMeetingFormikValues } from './DashboardDateTimePicker';
import MeetingFormSwitch from './MeetingFormSwitch';

interface StreamingOptionsProps {
  formik: FormikProps<CreateOrUpdateMeetingFormikValues>;
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
  const { enabled: streamingEnabled } = formik.values.streaming;

  return (
    <Stack
      sx={{
        gap: 2,
      }}
    >
      <MeetingFormSwitch
        checked={streamingEnabled}
        switchProps={formikMinimalProps('streaming.enabled', formik)}
        switchValueLabel={t(`dashboard-meeting-livestream-switch`)}
      />
      <Collapse orientation="vertical" in={streamingEnabled} unmountOnExit mountOnEnter>
        <OptionsRow>
          <CommonTextField
            {...formikProps('streaming.platform.kind', formik)}
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
            {...formikProps('streaming.platform.name', formik)}
            label={t('dashboard-meeting-livestream-platform-name-label')}
            placeholder={t('dashboard-meeting-livestream-platform-name-placeholder')}
          />
          <CommonTextField
            {...formikProps('streaming.platform.publicUrl', formik)}
            label={t('dashboard-meeting-livestream-public-url-label')}
            placeholder={t('global-URL-placeholder')}
          />
          <CommonTextField
            {...formikProps('streaming.platform.streamingEndpoint', formik)}
            label={t('dashboard-meeting-livestream-streaming-endpoint-label')}
            placeholder={t('dashboard-meeting-livestream-streaming-endpoint-placeholder')}
          />
          <CommonTextField
            {...formikProps('streaming.platform.streamingKey', formik)}
            label={t('dashboard-meeting-livestream-streaming-key-label')}
            placeholder={t('dashboard-meeting-livestream-streaming-key-placeholder')}
          />
        </OptionsRow>
      </Collapse>
    </Stack>
  );
};

export default StreamingOptions;
