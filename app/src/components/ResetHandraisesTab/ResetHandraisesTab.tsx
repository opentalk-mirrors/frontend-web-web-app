// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useRemoteParticipants } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';
import { useMemo, useState } from 'react';

import { resetRaisedHands } from '../../api/types/outgoing/raiseHands';
import { SearchAndSelectParticipantsTab } from '../../commonComponents/SearchAndSelectParticipantsTab';
import { toSelectableParticipant } from '../../commonComponents/SearchAndSelectParticipantsTab/fragments/utils';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { selectParticipantsWithRaisedHands } from '../../store/selectors';
import { selectRemoteParticipantsDisplayNameRecord } from '../../store/slices/participantsSlice';
import { ConnectionIdentifier, ParticipantId } from '../../types';
import { deconstructConnectionIdentifier } from '../../utils/deconstructConnectionIdentifier';

const ResetHandraisesTab = () => {
  const dispatch = useAppDispatch();
  const activeParticipants = useAppSelector(selectParticipantsWithRaisedHands);
  const activeIds = new Set(activeParticipants.map((p) => p.id));
  const remoteParticipants = useRemoteParticipants({
    updateOnlyOn: [RoomEvent.ParticipantConnected, RoomEvent.ParticipantDisconnected],
  }).filter((remote) => {
    const { participantId } = deconstructConnectionIdentifier(remote.identity as ConnectionIdentifier);
    return activeIds.has(participantId);
  });
  const remoteParticipantsIdentities = useMemo(
    () => remoteParticipants.map((participant) => participant.identity),
    [remoteParticipants]
  );

  const [search, setSearch] = useState<string>('');
  const [selectedParticipants, setSelectedParticipants] = useState<ParticipantId[]>([]);

  const participantNamesMap = useAppSelector((state) =>
    selectRemoteParticipantsDisplayNameRecord(state, remoteParticipantsIdentities)
  );

  const searchFilteredParticipantsList = useMemo(() => {
    return remoteParticipants
      .filter((participant) => {
        const displayName = participantNamesMap[participant.identity];
        return displayName?.toLocaleLowerCase().includes(search.toLocaleLowerCase());
      })
      .map((participant) => {
        const { participantId } = deconstructConnectionIdentifier(participant.identity as ConnectionIdentifier);
        return toSelectableParticipant(participant, selectedParticipants.includes(participantId));
      });
  }, [search, remoteParticipants, selectedParticipants, participantNamesMap]);

  const handleSelectParticipant = (checked: boolean, participantId: ParticipantId) => {
    if (checked) {
      setSelectedParticipants((prevState) => [...prevState, participantId]);
    } else {
      setSelectedParticipants((prevState) => prevState.filter((part) => part !== participantId));
    }
  };

  const resetAllHandraises = () => {
    dispatch(resetRaisedHands.action({}));
  };

  const resetSelectedHandraises = () => {
    if (selectedParticipants.length > 0) {
      dispatch(resetRaisedHands.action({ target: selectedParticipants }));
      setSelectedParticipants([]);
    }
  };

  return (
    <SearchAndSelectParticipantsTab
      handleAllClick={resetAllHandraises}
      handleSelectedClick={resetSelectedHandraises}
      handleSelectParticipant={handleSelectParticipant}
      handleSearchChange={setSearch}
      searchValue={search}
      participantsList={searchFilteredParticipantsList}
    />
  );
};

export default ResetHandraisesTab;
