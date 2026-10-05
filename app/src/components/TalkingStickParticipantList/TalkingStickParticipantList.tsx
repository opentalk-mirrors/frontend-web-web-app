// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { List, styled } from '@mui/material';

import { useAppSelector } from '../../hooks';
import { selectMyParticipantId, selectSpeakerId } from '../../store/slices/automodSlice';
import ParticipantListItem from './fragments/ParticipantListItem/ParticipantListItem';
import { ListableParticipant } from './types/participant';

const StyledList = styled(List)({
  display: 'flex',
  flexDirection: 'column',
  overflow: 'auto',
});

interface ParticipantListProps<T extends ListableParticipant> {
  participants: T[];
}

const TalkingStickParticipantList = <T extends ListableParticipant>({ participants = [] }: ParticipantListProps<T>) => {
  const activeSpeakerId = useAppSelector(selectSpeakerId);
  const myParticipantId = useAppSelector(selectMyParticipantId);
  const renderParticipantListItems = () => {
    return participants.map((participant) => (
      <ParticipantListItem
        key={participant.id}
        {...participant}
        isActiveSpeaker={participant.id === activeSpeakerId}
        isCurrentUser={participant.id === myParticipantId}
      />
    ));
  };

  return <StyledList>{renderParticipantListItems()}</StyledList>;
};

export default TalkingStickParticipantList;
