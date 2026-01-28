// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useAppSelector } from '../../../hooks';
import { selectPeopleTabParticipants } from '../../../store/selectors';
import ParticipantSimpleList from './ParticipantSimpleList';

const ParticipantNoGroups = () => {
  const participants = useAppSelector(selectPeopleTabParticipants);

  return <ParticipantSimpleList participants={participants} />;
};

export default ParticipantNoGroups;
