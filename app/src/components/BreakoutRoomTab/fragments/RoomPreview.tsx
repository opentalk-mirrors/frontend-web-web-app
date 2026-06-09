// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Collapse, List, ListItem } from '@mui/material';

import { Participant } from '../../../types';
import { RoomHeader } from './RoomHeader';

type RoomPreviewProps = {
  expanded: boolean;
  participants: Array<Pick<Participant, 'id' | 'displayName'>>;
  name: string;
  index: number;
  onEditButtonClick: (index: number, element: HTMLButtonElement) => void;
  onRoomExpandChange: (index: number) => void;
};

export function RoomPreview(props: RoomPreviewProps) {
  return (
    <Box px={0.5}>
      <RoomHeader
        expanded={props.expanded}
        name={props.name + ` (${props.participants.length})`}
        index={props.index}
        onEditButtonClick={props.onEditButtonClick}
        onRoomExpandChange={props.onRoomExpandChange}
      />
      <Collapse role="region" in={props.expanded}>
        <List>
          {props.participants.map(({ id, displayName }) => (
            <ListItem key={id}>{displayName}</ListItem>
          ))}
        </List>
      </Collapse>
    </Box>
  );
}
