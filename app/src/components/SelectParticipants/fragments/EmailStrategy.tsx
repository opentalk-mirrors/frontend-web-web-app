// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Stack, Typography } from '@mui/material';
import * as Yup from 'yup';

import { ParticipantAvatar } from '../../../commonComponents';
import { ParticipantOption } from './ParticipantOption';

const schema = Yup.string().email();

export const EmailStrategy = {
  getOptionLabel: (option: ParticipantOption) => {
    return option.email;
  },
  renderOption: (noOptionsText: string) => (props: React.HTMLAttributes<HTMLLIElement>, option: ParticipantOption) => {
    if (!schema.isValidSync(option.email)) {
      return (
        <Box
          key="no-options"
          component="li"
          style={props.style}
          className={props.className}
          sx={{
            display: 'flex',
          }}
        >
          <Typography noWrap>{noOptionsText}</Typography>
        </Box>
      );
    }

    return (
      <Box
        key={option.email}
        component="li"
        {...props}
        sx={[
          {
            display: 'flex',
          },
          ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
        ]}
      >
        <Box
          sx={{
            mr: 1,
          }}
        >
          <ParticipantAvatar specialCharacter="@" />
        </Box>
        <Stack>
          <Typography variant="caption" noWrap>
            {option.email}
          </Typography>
        </Stack>
      </Box>
    );
  },
};
