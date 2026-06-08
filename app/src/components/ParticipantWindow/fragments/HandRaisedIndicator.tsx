// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { keyframes, styled, Box as MuiBox } from '@mui/material';
import { truncate } from 'lodash';
import { useTranslation } from 'react-i18next';

import { RaiseHandOnIcon } from '../../../assets/icons';
import { useAppSelector } from '../../../hooks';
import { selectParticipantById } from '../../../store/slices/participantsSlice';
import type { ParticipantId } from '../../../types';

const waveAnimation = keyframes`
    0%,100% { transform:rotate(0) }
    20%,40%,60%,90% { transform:rotate(-90deg) scale(1.2)}
    30%,50%,80% { transform:rotate(10deg) scale(1.2)}
`;

const HandIconContainer = styled('div', {
  shouldForwardProp: (prop) => prop !== 'display',
})<{ display?: boolean }>(({ display, theme }) => ({
  background: theme.palette.primary.light,
  width: 'clamp(24px, 10cqi, 48px)',
  height: 'clamp(24px, 10cqi, 48px)',
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
    fill: theme.palette.primary.contrastText,
  },
}));

const HandRaisedBox = styled(MuiBox)({
  position: 'absolute',
  right: 5,
  bottom: 5,
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'flex-end',
});

const HandRaisedIndicator = ({ participantId }: { participantId: ParticipantId }) => {
  const { t } = useTranslation();

  const participant = useAppSelector(selectParticipantById(participantId));

  return (
    <HandRaisedBox role="alert" aria-live="assertive">
      {participant?.handIsUp && participant.handUpdatedAt && (
        <HandIconContainer
          display
          translate="no"
          aria-label={t('indicator-has-raised-hand', {
            participantName: truncate(participant.displayName || '', { length: 100 }),
          })}
        >
          <RaiseHandOnIcon type="decorative" />
        </HandIconContainer>
      )}
    </HandRaisedBox>
  );
};

export default HandRaisedIndicator;
