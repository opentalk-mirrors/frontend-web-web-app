// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Collapse, MenuItem, Stack } from '@mui/material';
import { TrainingParticipationReportParameterSet } from '@opentalk/rest-api-rtk-query/src/types/event';
import { FormikProps } from 'formik';
import { isEqual } from 'lodash';
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CommonTextField } from '../../../../commonComponents';
import { formikMinimalProps } from '../../../../utils/formikUtils';
import { MeetingFormValues } from '../DashboardDateTimePicker';
import MeetingFormSwitch from '../MeetingFormSwitch';
import { CustomTrainingParticipationReportDialog } from './CustomTrainingParticipationReportDialog';

interface TrainingParticipationReportSelectProps {
  formik: FormikProps<MeetingFormValues>;
}

enum TrainingParticipationReportConfigOptions {
  EveryThirtyMin = 'every-thirty-min',
  EverySixtyMin = 'every-sixty-min',
  ThirtyToSixtyMin = 'thirty-to-sixty-min',
  NinetyToOneHundredTwentyMin = 'ninety-to-hundred-twenty-min',
  Custom = 'custom',
}

const DEFAULT_CUSTOM_OPTION: TrainingParticipationReportParameterSet = {
  initialCheckpointDelay: { after: 600, within: 1200 },
  checkpointInterval: { after: 2700, within: 900 },
};

const PRESET_OPTIONS: Record<
  Exclude<TrainingParticipationReportConfigOptions, TrainingParticipationReportConfigOptions.Custom>,
  TrainingParticipationReportParameterSet
> = {
  [TrainingParticipationReportConfigOptions.EveryThirtyMin]: {
    initialCheckpointDelay: { after: 1800, within: 0 },
    checkpointInterval: { after: 1800, within: 0 },
  },
  [TrainingParticipationReportConfigOptions.EverySixtyMin]: {
    initialCheckpointDelay: { after: 3600, within: 0 },
    checkpointInterval: { after: 3600, within: 0 },
  },
  [TrainingParticipationReportConfigOptions.ThirtyToSixtyMin]: {
    initialCheckpointDelay: { after: 1800, within: 1800 },
    checkpointInterval: { after: 1800, within: 1800 },
  },
  [TrainingParticipationReportConfigOptions.NinetyToOneHundredTwentyMin]: {
    initialCheckpointDelay: { after: 5400, within: 1800 },
    checkpointInterval: { after: 5400, within: 1800 },
  },
};

const OPTION_KEYS: TrainingParticipationReportConfigOptions[] = [
  TrainingParticipationReportConfigOptions.EveryThirtyMin,
  TrainingParticipationReportConfigOptions.EverySixtyMin,
  TrainingParticipationReportConfigOptions.ThirtyToSixtyMin,
  TrainingParticipationReportConfigOptions.NinetyToOneHundredTwentyMin,
  TrainingParticipationReportConfigOptions.Custom,
];

const findPresetOption = (
  parameter?: TrainingParticipationReportParameterSet
): Exclude<TrainingParticipationReportConfigOptions, TrainingParticipationReportConfigOptions.Custom> | undefined => {
  if (!parameter) {
    return undefined;
  }

  return (
    Object.entries(PRESET_OPTIONS) as Array<
      [
        Exclude<TrainingParticipationReportConfigOptions, TrainingParticipationReportConfigOptions.Custom>,
        TrainingParticipationReportParameterSet,
      ]
    >
  ).find(([, option]) => isEqual(parameter, option))?.[0];
};

const resolveCustomOption = (parameter?: TrainingParticipationReportParameterSet) => {
  const presetOption = findPresetOption(parameter);

  if (!parameter || presetOption) {
    return DEFAULT_CUSTOM_OPTION;
  }

  return parameter;
};

export const TrainingParticipationReportSelect = ({ formik }: TrainingParticipationReportSelectProps) => {
  const { t } = useTranslation();
  const { enabled, parameter } = formik.values.trainingParticipationReport;
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);

  const presetOption = useMemo(() => findPresetOption(parameter), [parameter]);
  const customOption = useMemo(() => resolveCustomOption(parameter), [parameter]);
  const selectedOption = presetOption ?? TrainingParticipationReportConfigOptions.Custom;

  useEffect(() => {
    if (!enabled || parameter) {
      return;
    }

    formik.setFieldValue(
      'trainingParticipationReport.parameter',
      PRESET_OPTIONS[TrainingParticipationReportConfigOptions.EveryThirtyMin]
    );
  }, [enabled, formik, parameter]);

  const handleSelect = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const option = event.target.value as TrainingParticipationReportConfigOptions;

      if (option === TrainingParticipationReportConfigOptions.Custom) {
        setIsCustomDialogOpen(true);
        formik.setFieldValue('trainingParticipationReport.parameter', customOption);
        return;
      }

      formik.setFieldValue('trainingParticipationReport.parameter', PRESET_OPTIONS[option]);
    },
    [customOption, formik]
  );

  const handleSave = useCallback(
    (value: TrainingParticipationReportParameterSet) => {
      formik.setFieldValue('trainingParticipationReport.parameter', value);
      setIsCustomDialogOpen(false);
    },
    [formik]
  );

  return (
    <Stack spacing={2}>
      <MeetingFormSwitch
        switchProps={formikMinimalProps('trainingParticipationReport.enabled', formik)}
        checked={enabled}
        switchValueLabel={t('dashboard-meeting-training-participation-report-switch')}
      />
      <Collapse orientation="vertical" in={enabled} unmountOnExit mountOnEnter>
        <CommonTextField data-testid="parameter-select" select value={selectedOption} onChange={handleSelect}>
          {OPTION_KEYS.map((option) => (
            <MenuItem key={option} value={option}>
              {t(`dashboard-meeting-training-participation-report-option-${option}`)}
            </MenuItem>
          ))}
        </CommonTextField>
      </Collapse>

      {isCustomDialogOpen && (
        <CustomTrainingParticipationReportDialog
          closeDialog={() => setIsCustomDialogOpen(false)}
          previousOption={customOption}
          saveOption={handleSave}
        />
      )}
    </Stack>
  );
};
