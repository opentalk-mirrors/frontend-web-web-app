// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useRemoteParticipants } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';
import { useMemo, useState } from 'react';

import { mute } from '../../api/types/outgoing/moderation';
import { SearchAndSelectParticipantsTab } from '../../commonComponents/SearchAndSelectParticipantsTab';
import { SelectableParticipant } from '../../commonComponents/SearchAndSelectParticipantsTab/fragments/SelectParticipantsItem';
import { toSelectableParticipant } from '../../commonComponents/SearchAndSelectParticipantsTab/fragments/utils';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { selectRemoteParticipantsDisplayNameRecord } from '../../store/slices/participantsSlice';
import { ParticipantId } from '../../types';

const MuteParticipantsTab = () => {
  const dispatch = useAppDispatch();
  const allParticipants = useRemoteParticipants({
    updateOnlyOn: [
      RoomEvent.ParticipantConnected,
      RoomEvent.ParticipantDisconnected,
      RoomEvent.TrackMuted,
      RoomEvent.TrackUnmuted,
      RoomEvent.TrackPublished,
    ],
  });
  const unmutedParticipants = allParticipants.filter((participant) => participant.isMicrophoneEnabled);

  const [search, setSearch] = useState<string>('');
  const [selectedParticipants, setSelectedParticipants] = useState<ParticipantId[]>([]);

  const participantNames = useAppSelector((state) =>
    selectRemoteParticipantsDisplayNameRecord(state, unmutedParticipants)
  );

  const participantsList: SelectableParticipant[] = useMemo(() => {
    return unmutedParticipants
      .filter((participant) => {
        const displayName = participantNames[participant.identity];
        return displayName?.toLocaleLowerCase().includes(search.toLocaleLowerCase());
      })
      .map((participant) =>
        toSelectableParticipant(participant, selectedParticipants.includes(participant.identity as ParticipantId))
      );
  }, [search, unmutedParticipants, selectedParticipants, participantNames]);

  const handleSelectParticipant = (checked: boolean, participantId: ParticipantId) => {
    if (checked) {
      setSelectedParticipants((prevState) => [...prevState, participantId]);
    } else {
      setSelectedParticipants((prevState) => prevState.filter((part) => part !== participantId));
    }
  };

  // TODO - rethink combined id
  const muteAll = () => {
    const unmutedParticipantIds = unmutedParticipants.reduce<ParticipantId[]>((acc, p) => {
      const id = p.identity.split(':').at(0);
      if (id) {
        acc.push(id as ParticipantId);
      }
      return acc;
    }, []);

    dispatch(mute.action({ participants: unmutedParticipantIds }));
  };

  const muteSelected = () => {
    const participants = selectedParticipants
      .map((p) => p.split(':').at(0))
      .filter((v): v is ParticipantId => v !== undefined);
    dispatch(mute.action({ participants }));
    setSelectedParticipants([]);
  };

  return (
    <SearchAndSelectParticipantsTab
      handleAllClick={muteAll}
      handleSelectedClick={muteSelected}
      handleSelectParticipant={handleSelectParticipant}
      handleSearchChange={setSearch}
      searchValue={search}
      participantsList={participantsList}
    />
  );
};

export default MuteParticipantsTab;
