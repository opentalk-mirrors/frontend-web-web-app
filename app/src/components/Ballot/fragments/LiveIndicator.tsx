// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, styled, Tooltip } from '@mui/material';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

const TooltipIcon = styled('div', {
  shouldForwardProp: (prop) => prop !== 'color',
})(({ color }) => ({
  width: '1rem',
  height: '1rem',
  borderRadius: '100%',
  marginRight: '1rem',
  background: color,
}));

type LiveIndicatorProps = {
  isLive?: boolean;
};

export const LiveIndicator: FC<LiveIndicatorProps> = ({ isLive }) => {
  const { t } = useTranslation();

  const liveTooltip = t('live-indicator-live-tooltip');
  const notLiveTooltip = t('live-indicator-not-live-tooltip');

  return (
    <Box
      sx={{
        mt: 1,
      }}
    >
      <Tooltip title={isLive ? liveTooltip : notLiveTooltip}>
        <TooltipIcon color={isLive ? 'green' : 'red'} />
      </Tooltip>
    </Box>
  );
};
