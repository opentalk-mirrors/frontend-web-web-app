// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { keyframes, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { RaiseHandOnIcon } from '../../../assets/icons';
import { useAppSelector } from '../../../hooks';
import { selectParticipantById } from '../../../store/slices/participantsSlice';
import { ParticipantId } from '../../../types';

const waveAnimation = keyframes`
    0%,100% { transform:rotate(0) }
    20%,40%,60%,90% { transform:rotate(-90deg) scale(1.2)}
    30%,50%,80% { transform:rotate(10deg) scale(1.2)}
`;

const HandIconContainer = styled('div', {
  shouldForwardProp: (prop) => prop !== 'display',
})<{ display?: boolean }>(({ display, theme }) => ({
  background: theme.palette.secondary.light,
  width: theme.spacing(6),
  height: theme.spacing(6),
  borderRadius: '100%',
  padding: theme.spacing(0.5),
  justifyContent: 'center',
  alignItems: 'center',
  display: 'flex',
  transform: `scale(${display ? 1 : 0})`,
  transition: `transform 300ms ${display ? 'ease-out' : 'ease-in'}`,
  visibility: display ? 'visible' : 'hidden',

  '& svg': {
    animation: display ? `${waveAnimation} 3s 1 ease 400ms` : 'none',
    fill: theme.palette.secondary.contrastText,
  },
}));

const HandRaisedIndicator = ({ participantId }: { participantId: ParticipantId }) => {
  const { t } = useTranslation();

  const participant = useAppSelector(selectParticipantById(participantId));

  if (participant === undefined) {
    return <></>;
  }

  return (
    <HandIconContainer
      display={participant.handIsUp}
      translate="no"
      aria-label={t('indicator-has-raised-hand', { participantName: participant.displayName || '' })}
    >
      <RaiseHandOnIcon aria-label="raise-hand-icon" />
    </HandIconContainer>
  );
};

export default HandRaisedIndicator;
