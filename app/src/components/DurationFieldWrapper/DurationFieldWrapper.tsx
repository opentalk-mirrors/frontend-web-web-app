// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { BoxProps, Typography, Box } from '@mui/material';
import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

export const DurationFieldWrapper = (props: PropsWithChildren<BoxProps>) => {
  const { t } = useTranslation();

  return (
    <Box
      {...props}
      sx={[
        {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
      ]}
    >
      <Typography>{t('global-duration')}</Typography>
      <Box>{props.children}</Box>
    </Box>
  );
};
