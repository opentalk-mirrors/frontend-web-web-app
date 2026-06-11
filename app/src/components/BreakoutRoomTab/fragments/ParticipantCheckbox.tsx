// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Checkbox, FormControlLabel, Typography, useTheme } from '@mui/material';
import { truncate } from 'lodash';
import { ChangeEvent } from 'react';

import { ParticipantId } from '../../../types';

type ParticipantCheckboxProps = {
  id: ParticipantId;
  displayName: string;
  onChange(id: ParticipantId, nextChecked: boolean): void;
  value: 'indeterminate' | boolean;
};

export function ParticipantCheckbox(props: ParticipantCheckboxProps) {
  const theme = useTheme();

  const proxyChange = (_: ChangeEvent<HTMLInputElement>, nextChecked: boolean) => {
    props.onChange(props.id, nextChecked);
  };

  return (
    <FormControlLabel
      key={props.id}
      control={
        <Checkbox
          checked={props.value === true}
          id={props.id}
          onChange={proxyChange}
          color={theme.palette.mode === 'light' ? 'primary' : 'secondary'}
        />
      }
      label={
        <Typography translate="no" width="100%">
          {truncate(props.displayName, { length: 30 })}
        </Typography>
      }
      labelPlacement="start"
      sx={{ width: '100%' }}
      title={props.displayName}
    />
  );
}
