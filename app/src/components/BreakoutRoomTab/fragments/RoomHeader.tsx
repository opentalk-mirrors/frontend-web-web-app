// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Button, Typography } from '@mui/material';
import { MouseEvent, useRef } from 'react';

import { ArrowDownIcon, ArrowRightIcon } from '../../../assets/icons';

type RoomHeaderProps = {
  name: string;
  expanded: boolean;
  index: number;
  onRoomExpandChange: (index: number) => void;
  onEditButtonClick: (index: number, element: HTMLButtonElement) => void;
};

export function RoomHeader(props: RoomHeaderProps) {
  const editButtonReference = useRef<HTMLButtonElement>(null);

  const handleRoomNameButtonClick = () => {
    props.onRoomExpandChange(props.index);
  };

  const handleEditButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
    props.onEditButtonClick(props.index, event.currentTarget);
  };

  return (
    <Box display="flex" alignItems="center" gap={2}>
      <Button
        startIcon={props.expanded ? <ArrowDownIcon fontSize="small" /> : <ArrowRightIcon fontSize="small" />}
        variant="text"
        fullWidth
        size="small"
        sx={{ justifyContent: 'flex-start', pl: 1 }}
        onClick={handleRoomNameButtonClick}
      >
        <Typography component="h4" variant="body2">
          {props.name}
        </Typography>
      </Button>
      <Button
        size="small"
        variant="outlined"
        color="secondary"
        onClick={handleEditButtonClick}
        ref={editButtonReference}
      >
        Edit
      </Button>
    </Box>
  );
}
