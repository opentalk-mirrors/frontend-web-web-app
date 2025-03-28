// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  Checkbox,
  Grid,
  ListItemText,
  FormControlLabel as MuiFormControlLabel,
  ListItem as MuiListItem,
  ListItemAvatar as MuiListItemAvatar,
  styled,
} from '@mui/material';
import { RemoteParticipant } from 'livekit-client';
import React from 'react';

import { ParticipantAvatar } from '../../';
import { useAppSelector } from '../../../hooks';
import { selectParticipantAvatarUrl, selectParticipantName } from '../../../store/slices/participantsSlice';
import type { ParticipantId } from '../../../types';

export interface SelectableParticipant extends RemoteParticipant {
  selected: boolean;
}

type SelectParticipantsItemProps = {
  participant: SelectableParticipant;
  onCheck: (checked: boolean) => void;
};

const Avatar = styled(ParticipantAvatar)({
  width: '2.25rem',
  height: '2.25rem',
  fontSize: '0.75rem',
});

const ListItem = styled(MuiListItem)(({ theme }) => ({
  padding: theme.spacing(1, 0),
}));

const ListItemAvatar = styled(MuiListItemAvatar)(({ theme }) => ({
  minWidth: 'initial',
  marginRight: theme.spacing(1),
}));

const FormControlLabel = styled(MuiFormControlLabel)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  margin: 0,
}));

const SelectParticipantsItem = ({ participant, onCheck }: SelectParticipantsItemProps) => {
  const displayName = useAppSelector((state) => selectParticipantName(state, participant.identity as ParticipantId));
  const avatarUrl = useAppSelector((state) => selectParticipantAvatarUrl(state, participant.identity as ParticipantId));

  return (
    <ListItem alignItems="flex-start">
      <Grid container direction="row" wrap="nowrap" sx={{ flexGrow: 1 }}>
        <Grid sx={{ flexShrink: 0 }}>
          <ListItemAvatar>
            <Avatar src={avatarUrl}>{displayName}</Avatar>
          </ListItemAvatar>
        </Grid>
        <Grid size="grow">
          <FormControlLabel
            key={participant.identity}
            control={
              <Checkbox
                checked={participant.selected}
                id={participant.identity}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => onCheck(event.target.checked)}
              />
            }
            label={<ListItemText translate="no">{displayName}</ListItemText>}
            labelPlacement="start"
          />
        </Grid>
      </Grid>
    </ListItem>
  );
};

export default SelectParticipantsItem;
