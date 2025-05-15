// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Collapse, MenuItem, Stack } from '@mui/material';
import { TrainingParticipationReportParameterSet } from '@opentalk/rest-api-rtk-query/src/types/event';
import { FormikProps } from 'formik';
import { isEqual } from 'lodash';
import { useEffect, useState } from 'react';
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

export const TrainingParticipationReportSelect = ({ formik }: TrainingParticipationReportSelectProps) => {
  const { t } = useTranslation();
  const { enabled, parameter } = formik.values.trainingParticipationReport;
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);
  const [customOption, setCustomOption] = useState({
    initialCheckpointDelay: { after: 600, within: 1200 },
    checkpointInterval: { after: 2700, within: 900 },
  });

  const options: Record<TrainingParticipationReportConfigOptions, TrainingParticipationReportParameterSet> = {
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
    [TrainingParticipationReportConfigOptions.Custom]: customOption,
  };

  const [selectedOption, setSelectedOption] = useState(TrainingParticipationReportConfigOptions.EveryThirtyMin);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (parameter) {
      const existingOptionKey = (Object.keys(options) as Array<TrainingParticipationReportConfigOptions>).find(
        (option) => isEqual(parameter, options[option])
      );
      if (existingOptionKey) {
        setSelectedOption(existingOptionKey);
      } else {
        setSelectedOption(TrainingParticipationReportConfigOptions.Custom);
        setCustomOption(parameter);
      }
      return;
    }

    formik.setFieldValue(
      'trainingParticipationReport.parameter',
      options[TrainingParticipationReportConfigOptions.EveryThirtyMin]
    );
  }, [enabled]);

  const handleSelect = (option: TrainingParticipationReportConfigOptions) => {
    if (option === TrainingParticipationReportConfigOptions.Custom) {
      setIsCustomDialogOpen(true);
    }

    setSelectedOption(option);
    formik.setFieldValue('trainingParticipationReport.parameter', options[option]);
  };

  const handleSave = (value: TrainingParticipationReportParameterSet) => {
    setCustomOption(value);
    formik.setFieldValue('trainingParticipationReport.parameter', value);
    setIsCustomDialogOpen(false);
  };

  return (
    <Stack spacing={2}>
      <MeetingFormSwitch
        switchProps={formikMinimalProps('trainingParticipationReport.enabled', formik)}
        checked={enabled}
        switchValueLabel={t('dashboard-meeting-training-participation-report-switch')}
      />
      <Collapse orientation="vertical" in={enabled} unmountOnExit mountOnEnter>
        <CommonTextField data-testid="parameter-select" select value={selectedOption}>
          {Object.keys(options).map((option) => (
            <MenuItem
              key={option}
              value={option}
              onClick={() => handleSelect(option as TrainingParticipationReportConfigOptions)}
            >
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
