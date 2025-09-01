// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Stack, Typography } from '@mui/material';
import type { ParticipantOption } from '@opentalk/rest-api-rtk-query';

import { ParticipantAvatar, setLibravatarOptions } from '../../../commonComponents';
import { LibravatarDefaultImage } from '../../../types';
import { HTMLLIElementWithSxProps } from '../types';

export const SuggestedUserStrategy = {
  getOptionLabel: (option: ParticipantOption) => {
    if ('firstname' in option) {
      return `${option.firstname} ${option.lastname} ${option.email}`;
    }

    return '';
  },
  renderOption:
    (defaultImage: LibravatarDefaultImage) =>
    (props: HTMLLIElementWithSxProps & { key: string }, option: ParticipantOption) => {
      if ('firstname' in option) {
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
              <ParticipantAvatar
                src={setLibravatarOptions(option.avatarUrl, { defaultImage })}
              >{`${option.firstname} ${option.lastname}`}</ParticipantAvatar>
            </Box>
            <Stack>
              <Typography noWrap>
                {option.firstname} {option.lastname}
              </Typography>
              <Typography variant="caption" noWrap>
                {option.email}
              </Typography>
            </Stack>
          </Box>
        );
      }

      return null;
    },
};
