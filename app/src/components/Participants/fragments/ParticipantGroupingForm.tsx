// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled, FormControlLabel as MuiFormControlLabel, Typography } from '@mui/material';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { CommonSwitch } from '../../../commonComponents';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { selectShowParticipantGroups, setSortByGroups } from '../../../store/slices/uiSlice';

const FormControlLabel = styled(MuiFormControlLabel)({
  marginLeft: 0,
  marginRight: 0,
  justifyContent: 'space-between',
});

const ParticipantGroupingForm = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const participantGroupingEnabled = useAppSelector(selectShowParticipantGroups);

  return (
    <FormControlLabel
      control={
        <CommonSwitch
          color="primary"
          onChange={(_, checked) => dispatch(setSortByGroups(checked))}
          value={participantGroupingEnabled}
          checked={participantGroupingEnabled}
        />
      }
      label={
        <Typography variant="body2">{t(participantGroupingEnabled ? 'sort-groups-on' : 'sort-groups-off')}</Typography>
      }
      labelPlacement="start"
    />
  );
};

export default memo(ParticipantGroupingForm);
