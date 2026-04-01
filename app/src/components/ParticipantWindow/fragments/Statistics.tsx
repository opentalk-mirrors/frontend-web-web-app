// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useRemoteParticipant } from '@livekit/components-react';
import { Popover, Tooltip } from '@mui/material';
import { ConnectionQuality } from 'livekit-client';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ConnectionGoodIcon, ConnectionMediumIcon } from '../../../assets/icons';
import { MediaDescriptor } from '../../../modules/WebRTC';
import { OverlayIconButton } from './OverlayIconButton';

// Will be addressed in https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2129
// import { StatisticsContent } from './StatisticsContent';

const Statistics = ({
  descriptor,
  disablePopoverPortal,
}: {
  descriptor: MediaDescriptor;
  disablePopoverPortal?: boolean | undefined;
}) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const participant = useRemoteParticipant(descriptor.connectionIdentifier);
  const isOnline = participant?.connectionQuality !== ConnectionQuality.Lost;
  const hasPacketLoss = participant?.connectionQuality === ConnectionQuality.Poor;

  const handleClose = useCallback((event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(null);
  }, []);

  const toggleStats = useCallback((event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  }, []);

  if (!isOnline) {
    return null;
  }

  return (
    <>
      <Tooltip title={t('video-overlay-tooltip-connection-info')}>
        <OverlayIconButton onClick={toggleStats} size="large" color="secondary" aria-label={t('statistics-video')}>
          {hasPacketLoss ? <ConnectionMediumIcon color="error" /> : <ConnectionGoodIcon />}
        </OverlayIconButton>
      </Tooltip>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        disablePortal={disablePopoverPortal}
        keepMounted={false}
      >
        {/* <StatisticsContent descriptor={descriptor} /> */}
      </Popover>
    </>
  );
};

export default Statistics;
