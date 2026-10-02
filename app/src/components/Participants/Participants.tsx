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
      sx={{
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
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
