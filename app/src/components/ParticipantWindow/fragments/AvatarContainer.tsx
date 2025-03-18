// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Grid, styled } from '@mui/material';

import { ParticipantAvatar } from '../../../commonComponents';
import { useAppSelector } from '../../../hooks';
import {
  selectParticipantAvatarUrl,
  selectParticipantName,
  selectParticipationKind,
} from '../../../store/slices/participantsSlice';
import { ParticipantId, ParticipationKind } from '../../../types';

const Container = styled(Grid)({
  transition: 'all 300ms linear',
  '& *': {
    transition: 'opacity 300ms linear 300ms',
  },
});

const Avatar = styled(ParticipantAvatar)(({ theme }) => ({
  width: theme.spacing(10),
  height: theme.spacing(10),
}));

interface AvatarContainerProps {
  participantId: ParticipantId;
}

export const AvatarContainer = ({ participantId }: AvatarContainerProps) => {
  const displayName = useAppSelector((state) => selectParticipantName(state, participantId));
  const avatarUrl = useAppSelector((state) => selectParticipantAvatarUrl(state, participantId));
  const participationKind = useAppSelector((state) => selectParticipationKind(state, participantId));

  return (
    <Container
      container
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      flexWrap="nowrap"
      data-testid="avatarContainer"
    >
      <Avatar src={avatarUrl} isSipParticipant={participationKind === ParticipationKind.Sip}>
        {displayName || ''}
      </Avatar>
    </Container>
  );
};
