// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, BoxProps, Stack, Typography, styled } from '@mui/material';
import Color from 'colorjs.io';
import { omit } from 'lodash';
import { useTranslation } from 'react-i18next';

import { CameraOffIcon, MicOffIcon } from '../../assets/icons';

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

type NameTileProps = {
  displayName: string;
  videoOn?: boolean;
  audioOn?: boolean;
} & BoxProps;

const NameTile = ({ displayName, videoOn = false, audioOn = false, ...props }: NameTileProps) => {
  const { t } = useTranslation();

  const renderCameraOffIcon = () => !videoOn && <CameraOffIcon data-testid="camOff" />;
  const renderAudioOffIcon = () => !audioOn && <StyledMicOffIcon data-testid="micOff" />;

  const renderIconBox = () =>
    !(audioOn && videoOn) && (
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

  const boxProps = omit(props, 'displayName', 'videoOn', 'audioOn');

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
