// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Grid, styled } from '@mui/material';

import { ParticipantAvatar } from '../../commonComponents';

const Container = styled(Grid)({
  width: '100%',
  height: '100%',
  transition: 'all 300ms linear',
  '& *': {
    transition: 'opacity 300ms linear 300ms',
  },
});

const Avatar = styled(ParticipantAvatar)(({ theme }) => ({
  width: theme.spacing(10),
  height: theme.spacing(10),
}));

export interface ParticipantVideoFallbackProps {
  displayName?: string;
  avatarUrl?: string;
  isSipParticipant?: boolean;
}

const ParticipantVideoFallback = ({ displayName, avatarUrl, isSipParticipant }: ParticipantVideoFallbackProps) => {
  return (
    <Container
      container
      sx={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flexWrap: 'center' }}
    >
      <Avatar src={avatarUrl} isSipParticipant={isSipParticipant}>
        {displayName ?? ''}
      </Avatar>
    </Container>
  );
};

export default ParticipantVideoFallback;
