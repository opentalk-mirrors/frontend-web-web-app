// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, FormLabel, MenuItem, Select, SelectChangeEvent, styled } from '@mui/material';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { DropdownOptions } from './constants';

type SelectionModeRowProps = {
  value: DropdownOptions;
  onChange: (event: SelectChangeEvent) => void;
};

const StyledFormLabel = styled(FormLabel)(({ theme }) => ({
  color: theme.palette.text.primary,
}));

export function SelectionModeRow(props: SelectionModeRowProps) {
  const { t } = useTranslation();
  const id = useId();
  const selectId = `${id}-select`;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <StyledFormLabel id={id} htmlFor={selectId}>
        {t('breakout-room-form-field-based-on')}
      </StyledFormLabel>
      <Select id={selectId} name="selectionMode" labelId={id} value={props.value} onChange={props.onChange}>
        <MenuItem value={DropdownOptions.Rooms}>{t('global-rooms')}</MenuItem>
        <MenuItem value={DropdownOptions.Participants}>{t('global-participants')}</MenuItem>
      </Select>
    </Box>
  );
}
