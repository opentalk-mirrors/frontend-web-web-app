// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useRemoteParticipants } from '@livekit/components-react';
import { useMemo, useState } from 'react';

import { resetRaisedHands } from '../../api/types/outgoing/moderation';
import { SearchAndSelectParticipantsTab } from '../../commonComponents/SearchAndSelectParticipantsTab';
import { toSelectableParticipant } from '../../commonComponents/SearchAndSelectParticipantsTab/fragments/utils';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { selectParticipantsWithRaisedHands } from '../../store/selectors';
import { selectMapRemotePaticipanstDisplayName } from '../../store/slices/participantsSlice';
import { ParticipantId } from '../../types';

const ResetHandraisesTab = () => {
  const dispatch = useAppDispatch();
  const activeParticipants = useAppSelector(selectParticipantsWithRaisedHands);
  const remoteParticipants = useRemoteParticipants().filter((remote) =>
    activeParticipants.some((active) => active.id === remote.identity)
  );

  const [search, setSearch] = useState<string>('');
  const [selectedParticipants, setSelectedParticipants] = useState<ParticipantId[]>([]);

  const participantNames = useAppSelector((state) => selectMapRemotePaticipanstDisplayName(state, remoteParticipants));

  const searchFilteredParticipantsList = useMemo(() => {
    return remoteParticipants
      .filter((participant) => {
        const displayName = participantNames[participant.identity];
        return displayName?.toLocaleLowerCase().includes(search.toLocaleLowerCase());
      })
      .map((participant) =>
        toSelectableParticipant(participant, selectedParticipants.includes(participant.identity as ParticipantId))
      );
  }, [search, remoteParticipants, selectedParticipants, participantNames]);

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
