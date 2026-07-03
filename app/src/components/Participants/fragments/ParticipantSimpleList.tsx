// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { FC } from 'react';
import { List as ReactWindowList } from 'react-window';

import { Participant } from '../../../types';
import ParticipantListItem from './ParticipantListItem';

const ROW_HEIGHT = 69;
const OVERSCAN_COUNT = 4;

interface ParticipantSimpleListProps {
  participants: Participant[];
}

const ParticipantSimpleList: FC<ParticipantSimpleListProps> = ({ participants }) => (
  <ReactWindowList
    rowComponent={ParticipantListItem}
    rowHeight={ROW_HEIGHT}
    rowCount={participants.length}
    rowProps={{ data: participants }}
    overscanCount={OVERSCAN_COUNT}
  />
);

export default ParticipantSimpleList;
