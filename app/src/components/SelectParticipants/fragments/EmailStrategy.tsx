// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Stack, Typography } from '@mui/material';
import type { ParticipantOption } from '@opentalk/rest-api-rtk-query';
import { Key } from 'react';
import * as Yup from 'yup';

import { ParticipantAvatar } from '../../../commonComponents';
import { HTMLLIElementWithSxProps } from '../types';

const schema = Yup.string().email();

export const EmailStrategy = {
  getOptionLabel: (option: ParticipantOption) => {
    return option.email;
  },
  renderOption:
    (noOptionsText: string) => (props: HTMLLIElementWithSxProps & { key: Key }, option: ParticipantOption) => {
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
      const { key, ...propsWithoutKey } = props;
      return (
        <Box
          key={key}
          component="li"
          {...propsWithoutKey}
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
