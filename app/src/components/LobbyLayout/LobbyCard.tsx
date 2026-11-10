// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, styled } from '@mui/material';
import Color from 'colorjs.io';

import arrowImage from '../../assets/images/arrow-illustration.png';

const LobbyCard = styled(Box)(({ theme }) => {
  const background = new Color(theme.palette.background.customPaper.primary);
  background.alpha = 0.5;

  return {
    position: 'relative',
    padding: 0,
    width: '100%',
    maxWidth: '1200px',

    //The blur should be part of the theme and handled globally
    backdropFilter: 'blur(100px)',
    WebkitBackdropFilter: 'blur(100px)',
    backgroundImage: `url(${arrowImage})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: '77% 67%',
    backgroundColor: background.toString({ format: 'rgba' }),
    color: theme.palette.background.customPaper.contrastText,
    backgroundSize: '10rem',
    '& .MuiButtonBase-root.Mui-focusVisible': {
      outline: theme.palette.focus.outline,
    },
  };
});

export default LobbyCard;
