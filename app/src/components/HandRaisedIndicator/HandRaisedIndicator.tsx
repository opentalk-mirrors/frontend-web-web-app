// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { keyframes, styled, Box } from '@mui/material';

import { RaiseHandOnIcon } from '../../assets/icons';

const waveAnimation = keyframes`
    0%,100% { transform:rotate(0) }
    20%,40%,60%,90% { transform:rotate(-90deg) scale(1.2)}
    30%,50%,80% { transform:rotate(10deg) scale(1.2)}
`;
const HandRaisedIconContainer = styled(Box)(({ theme }) => ({
  background: theme.palette.primary.light,
  width: 'clamp(20px, 10cqi, 48px)',
  height: 'clamp(20px, 10cqi, 48px)',
  borderRadius: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  display: 'flex',
  '& svg': {
    width: '100%',
    height: '60%',
    animation: `${waveAnimation} 3s 1 ease 400ms`,
    fill: theme.palette.primary.contrastText,
  },
}));

interface HandRaisedIndicatorProps {
  label: string;
  className?: string;
}

const HandRaisedIndicator = ({ label, className }: HandRaisedIndicatorProps) => (
  <HandRaisedIconContainer translate="no" className={className} aria-label={label} role="img">
    <RaiseHandOnIcon type="decorative" />
  </HandRaisedIconContainer>
);

export default HandRaisedIndicator;
