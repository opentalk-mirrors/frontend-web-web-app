// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { List, ListProps, styled } from '@mui/material';
import { FC } from 'react';
import { List as ReactWindowList } from 'react-window';

import { Participant } from '../../../types';
import ParticipantListItem from './ParticipantListItem';

const ROW_HEIGHT = 69;
const OVERSCAN_COUNT = 4;

const CustomList = styled(List)(({ theme }) => ({
  overflow: 'hidden',
  textAlign: 'left',
  width: '100%',
  height: '100%',
  [theme.breakpoints.down('sm')]: {
    minHeight: '40vh',
  },
})) as typeof List;

interface ParticipantSimpleListProps extends ListProps {
  participants: Participant[];
}

const ParticipantSimpleList: FC<ParticipantSimpleListProps> = ({ participants, ...props }) => (
  <CustomList
    {...props}
    component={() => (
      <ReactWindowList
        rowComponent={ParticipantListItem}
        rowHeight={ROW_HEIGHT}
        rowCount={participants.length}
        rowProps={{ data: participants }}
        overscanCount={OVERSCAN_COUNT}
      />
    )}
  />
);

export default ParticipantSimpleList;
