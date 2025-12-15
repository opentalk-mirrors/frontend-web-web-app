// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { List } from '@mui/material';

import { ConnectionIdentifier, ParticipantId } from '../../../types';
import { deconstructIdentity } from '../../../utils/deconstructIdentity';
import SelectParticipantsItem, { SelectableParticipant } from './SelectParticipantsItem';

type SelectParticipantsListProps = {
  participantsList: SelectableParticipant[];
  onCheck: (checked: boolean, participantId: ParticipantId) => void;
};

const SelectParticipantsList = ({ participantsList, onCheck }: SelectParticipantsListProps) => (
  <List>
    {participantsList.map((participant) => (
      <SelectParticipantsItem
        participant={participant}
        onCheck={(checked) => {
          const { participantId } = deconstructIdentity(participant.identity as ConnectionIdentifier);
          onCheck(checked, participantId);
        }}
        key={participant.identity}
      />
    ))}
  </List>
);

export default SelectParticipantsList;
