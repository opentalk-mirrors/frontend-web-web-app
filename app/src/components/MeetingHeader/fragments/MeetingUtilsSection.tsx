// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useLocalParticipant } from '@livekit/components-react';
import { Box, Grid, Stack, Tooltip, Typography, styled } from '@mui/material';
import { ConnectionQuality } from 'livekit-client';
import { useTranslation } from 'react-i18next';

import {
  ConnectionBadIcon,
  LiveIcon,
  RecordingsIcon,
  DurationIcon,
  AutomaticMeetingProtocolOnIcon,
} from '../../../assets/icons';
import { useAppSelector } from '../../../hooks';
import { selectIsRecordingActive, selectIsStreamActive } from '../../../store/slices/streamingSlice';
import { selectIsAutomaticMeetingProtocolRunning } from '../../../store/slices/transcriptionSlice';
import { selectIsModerator } from '../../../store/slices/userSlice';
import { getLocationProtocol } from '../../../utils/apiUtils';
import PopoverButton from '../../PopoverButton.tsx/PopoverButton';
import SecurityBadge from '../../SecurityBadge/SecurityBadge';
import MeetingTimer from './MeetingTimer';
import WaitingParticipantsPopover from './WaitingParticipantsPopover';

const ContainerWithBackground = styled(Stack)(({ theme }) => ({
  background: theme.palette.background.customPaper.primary,
  color: theme.palette.background.customPaper.contrastText,
  height: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(0, 1),
  borderRadius: '0.25rem',
  //Applies proper size to each icon inside
  '& .MuiSvgIcon-root': {
    fontSize: theme.typography.pxToRem(16),
  },
}));

const IconContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  padding: theme.spacing(0, 1),
  borderRadius: '0.25rem',
  background: theme.palette.background.customPaper.primary,
  color: theme.palette.error.light,
}));

const Container = styled(Stack)({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
});

const BadConnectionIcon = styled(ConnectionBadIcon)(({ theme }) => ({
  color: theme.palette.warning.main,
  '&.MuiSvgIcon-root': {
    fontSize: theme.typography.pxToRem(24),
  },
}));

const BadConnectionContainer = ({ text }: { text: string }) => {
  return (
    <Grid
      container
      sx={{
        maxWidth: '24rem',
        alignItems: 'center',
      }}
    >
      <Typography>{text}</Typography>
    </Grid>
  );
};

const MeetingUtilsSection = () => {
  const isModerator = useAppSelector(selectIsModerator);
  const isRecordingActive = useAppSelector(selectIsRecordingActive);
  const isStreamingActive = useAppSelector(selectIsStreamActive);
  const isAutomaticMeetingProtocolRunning = useAppSelector(selectIsAutomaticMeetingProtocolRunning);
  const showSecurityBadge = getLocationProtocol() === 'https:';
  const { t } = useTranslation();
  const { localParticipant } = useLocalParticipant();

  return (
    <Container spacing={1} direction="row">
      {localParticipant.connectionQuality === ConnectionQuality.Poor && (
        <ContainerWithBackground spacing={1} direction="row">
          <PopoverButton
            icon={<BadConnectionIcon />}
            content={<BadConnectionContainer text={t('media-bad-connection')} />}
            buttonLabel={t('bad-media-connection-button-label')}
            titleLabel="bad-media-connection-title"
            popoverTitleId="bad-media-connection-title-id"
          />
        </ContainerWithBackground>
      )}
      {isModerator && <WaitingParticipantsPopover />}
      <ContainerWithBackground spacing={1} direction="row">
        <DurationIcon />
        <MeetingTimer aria-label="current time" />
        {showSecurityBadge && <SecurityBadge />}
      </ContainerWithBackground>
      {isRecordingActive && (
        <IconContainer>
          <Tooltip title={t('recording-started-tooltip')}>
            <RecordingsIcon aria-label={t('recording-active-label')} />
          </Tooltip>
        </IconContainer>
      )}
      {isStreamingActive && (
        <IconContainer>
          <LiveIcon aria-label={t('livestream-active-label')} />
        </IconContainer>
      )}
      {isAutomaticMeetingProtocolRunning && (
        <IconContainer>
          <Tooltip title={t('automatic-meeting-protocol-active')}>
            <AutomaticMeetingProtocolOnIcon aria-label={t('automatic-meeting-protocol-active')} />
          </Tooltip>
        </IconContainer>
      )}
    </Container>
  );
};

export default MeetingUtilsSection;
