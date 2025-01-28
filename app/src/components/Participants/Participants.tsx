// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Stack } from '@mui/material';

import { useAppSelector } from '../../hooks';
import { selectTalkingStickParticipants } from '../../store/selectors';
import { selectAutomodActiveState } from '../../store/slices/automodSlice';
import { TalkingStickParticipantList } from '../TalkingStickParticipantList';
import ParticipantsContainer from './fragments/ParticipantsContainer';

const Participants = () => {
  const isAutomodActive = useAppSelector(selectAutomodActiveState);
  const talkingStickParticipants = useAppSelector(selectTalkingStickParticipants);

  return (
    <Stack
      spacing={2}
      sx={{
        flex: 1,
        overflow: 'hidden',
        pt: 0.7,
      }}
    >
      {isAutomodActive ? (
        <TalkingStickParticipantList participants={talkingStickParticipants} />
      ) : (
        <ParticipantsContainer />
      )}
    </Stack>
  );
};

export default Participants;
