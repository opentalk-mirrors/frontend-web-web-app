// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useParticipants } from '@livekit/components-react';
import { Box, BoxProps, Stack, Typography, styled } from '@mui/material';
import Color from 'colorjs.io';
import { omit } from 'lodash';
import { useTranslation } from 'react-i18next';

import { CameraOffIcon, MicOffIcon } from '../../assets/icons';
import { ParticipantId } from '../../types';

const NameBox = styled(Box)(({ theme }) => {
  const background = new Color(theme.palette.background.customPaper.primary);
  background.alpha = 0.6;

  return {
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '80%',
    padding: theme.spacing(0.5, 1),
    background: background.toString({ format: 'rgba' }),
    color: theme.palette.text.primary,
    borderRadius: +theme.borderRadius.small * 2,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    '&.positionBottom': {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      marginLeft: 'auto',
      marginRight: 'auto',
      width: 'fit-content',
    },
  };
});

const IconBox = styled(Stack)(({ theme }) => ({
  paddingRight: theme.spacing(0.5),
  '& svg': {
    fontSize: 'inherit',
  },
  '& .off-line': {
    fill: theme.palette.danger.light,
  },
}));

const StyledMicOffIcon = styled(MicOffIcon)(({ theme }) => ({
  '& rect': {
    fill: theme.palette.primary.contrastText,
  },
}));

type NameTileBaseProps = {
  displayName: string;
} & BoxProps;

type LocalNameTileProps = {
  localVideoOn: boolean;
  localAudioOn: boolean;
} & NameTileBaseProps;

type RemoteNameTileProps = {
  participantId: ParticipantId;
} & NameTileBaseProps;

type NameTileProps = LocalNameTileProps | RemoteNameTileProps;

const NameTile = ({ displayName, ...props }: NameTileProps) => {
  const { t } = useTranslation();
  const participants = useParticipants();

  let isVideoActive = false;
  let isAudioActive = false;

  if ('participantId' in props) {
    const { participantId } = props;
    const participant = participants.find((participant) => participant.identity === participantId);
    isVideoActive = participant?.isCameraEnabled || false;
    isAudioActive = participant?.isMicrophoneEnabled || false;
  } else {
    const { localVideoOn, localAudioOn } = props;
    isVideoActive = Boolean(localVideoOn);
    isAudioActive = Boolean(localAudioOn);
  }

  const renderCameraOffIcon = () => !isVideoActive && <CameraOffIcon data-testid="camOff" />;
  const renderAudioOffIcon = () => !isAudioActive && <StyledMicOffIcon data-testid="micOff" />;
  const renderIconBox = () =>
    !(isAudioActive && isVideoActive) && (
      <IconBox
        data-testid="iconBox"
        direction="row"
        spacing={0.5}
        aria-label={t('indicator-has-audio-off', {
          participantName: displayName,
        })}
      >
        {renderCameraOffIcon()}
        {renderAudioOffIcon()}
      </IconBox>
    );

  const boxProps = omit(props, 'participantId', 'localVideoOn', 'localAudioOn');

  return (
    <NameBox data-testid="nameTile" {...boxProps}>
      {renderIconBox()}
      <Typography
        variant="body2"
        noWrap
        translate="no"
        sx={{
          py: 0,
        }}
      >
        {displayName}
      </Typography>
    </NameBox>
  );
};

export default NameTile;
