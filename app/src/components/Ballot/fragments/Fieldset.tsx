// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled } from '@mui/material';

export const Fieldset = styled('fieldset')(() => ({
  border: 'none',
  padding: 0,
  margin: 0,
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  '& legend': {
    width: '100%',
    padding: 0,
    margin: 0,
  },
}));
