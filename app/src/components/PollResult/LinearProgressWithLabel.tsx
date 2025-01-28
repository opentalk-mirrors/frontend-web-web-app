// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, LinearProgress, LinearProgressProps, Typography } from '@mui/material';

const LinearProgressWithLabel = (props: LinearProgressProps & { label: string; absolute: number; sum: number }) => {
  const value = (props.absolute * 100) / props.sum || 0;
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          width: '100%',
          mr: 1,
        }}
      >
        <Typography variant="body2" color="textPrimary">
          {props.label}
        </Typography>
      </Box>
      <Box
        sx={{
          width: '100%',
          mr: 1,
        }}
      >
        <LinearProgress variant="determinate" {...props} value={value} />
      </Box>
      <Box
        sx={{
          minWidth: 60,
        }}
      >
        <Typography variant="body2" color="textSecondary">
          {`${Math.round(value)}%`} ({`${props.absolute}/${props.sum}`})
        </Typography>
      </Box>
    </Box>
  );
};
export default LinearProgressWithLabel;
