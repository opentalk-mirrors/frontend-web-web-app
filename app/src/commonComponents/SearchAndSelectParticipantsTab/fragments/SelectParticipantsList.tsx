// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { List } from '@mui/material';

import { ParticipantId } from '../../../types';
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
        onCheck={(checked) => onCheck(checked, participant.identity as ParticipantId)}
        key={participant.identity}
      />
    ))}
  </List>
);

export default SelectParticipantsList;
