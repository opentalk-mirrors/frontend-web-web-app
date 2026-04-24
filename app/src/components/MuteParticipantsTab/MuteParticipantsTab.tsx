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
import { ConnectionIdentifier, ParticipantId } from '../../types';
import { deconstructConnectionIdentifier } from '../../utils/deconstructConnectionIdentifier';

const MuteParticipantsTab = () => {
  const dispatch = useAppDispatch();
  const allParticipants = useRemoteParticipants({
    updateOnlyOn: [
      RoomEvent.ParticipantConnected,
      RoomEvent.ParticipantDisconnected,
      RoomEvent.TrackMuted,
      RoomEvent.TrackUnmuted,
      RoomEvent.TrackPublished,
      RoomEvent.TrackUnpublished,
    ],
  });

  const unmutedParticipants = useMemo(() => {
    return allParticipants.filter((participant) => participant.isMicrophoneEnabled);
  }, [allParticipants]);

  const unmutedIdentities = useMemo(
    () => unmutedParticipants.map((participant) => participant.identity),
    [unmutedParticipants]
  );

  const [search, setSearch] = useState<string>('');
  const [selectedParticipants, setSelectedParticipants] = useState<ParticipantId[]>([]);

  const participantNames = useAppSelector((state) =>
    selectRemoteParticipantsDisplayNameRecord(state, unmutedIdentities)
  );

  const participantsList: SelectableParticipant[] = useMemo(() => {
    return unmutedParticipants
      .filter((participant) => {
        const displayName = participantNames[participant.identity];
        return displayName?.toLocaleLowerCase().includes(search.toLocaleLowerCase());
      })
      .map((participant) => {
        const { participantId } = deconstructConnectionIdentifier(participant.identity as ConnectionIdentifier);
        return toSelectableParticipant(participant, selectedParticipants.includes(participantId));
      });
  }, [search, unmutedParticipants, selectedParticipants, participantNames]);

  const handleSelectParticipant = (checked: boolean, participantId: ParticipantId) => {
    if (checked) {
      setSelectedParticipants((prevState) => [...prevState, participantId]);
    } else {
      setSelectedParticipants((prevState) => prevState.filter((part) => part !== participantId));
    }
  };

  const muteAll = () => {
    const unmutedParticipantIds = unmutedParticipants.reduce<ParticipantId[]>((acc, p) => {
      const { participantId } = deconstructConnectionIdentifier(p.identity as ConnectionIdentifier);
      if (participantId) {
        acc.push(participantId);
      }
      return acc;
    }, []);

    dispatch(mute.action({ participants: unmutedParticipantIds }));
  };

  const muteSelected = () => {
    dispatch(mute.action({ participants: selectedParticipants }));
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
