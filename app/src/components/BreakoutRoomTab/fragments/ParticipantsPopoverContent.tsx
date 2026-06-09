// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, Container, Stack, styled, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Participant, ParticipantId } from '../../../types';
import { ParticipantCheckbox } from './ParticipantCheckbox';

type ParticipantsPopoverProps = {
  editingRoomIndex: number;
  participants: Array<Pick<Participant, 'id' | 'displayName'>>;
  assignedParticipants: ReadonlyArray<ParticipantId>;
  onCancel: () => void;
  onSave: (participants: ReadonlyArray<ParticipantId>) => void;
};

const Title = styled(Typography)(({ theme }) => ({
  margin: theme.spacing(2),
  padding: theme.spacing(1),
  borderRadius: theme.spacing(0.75),
  backgroundColor: theme.palette.background.highlight.primary,
}));

const ButtonGroup = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  gap: theme.spacing(4),
  padding: theme.spacing(1.25, 2),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

export function ParticipantsPopoverContent(props: ParticipantsPopoverProps) {
  const { t } = useTranslation();

  const [selectedParticipants, setSelectedParticipants] = useState<Set<ParticipantId>>(
    new Set(props.assignedParticipants)
  );

  const participantsInConference = new Set<ParticipantId>(props.participants.map((participant) => participant.id));

  const handleCheckboxChange = (participantId: ParticipantId, checked: boolean) => {
    setSelectedParticipants((prevSelectedParticipants) => {
      const newSelectedParticipants = new Set(prevSelectedParticipants);
      if (checked) {
        newSelectedParticipants.add(participantId);
      } else {
        newSelectedParticipants.delete(participantId);
      }
      return newSelectedParticipants;
    });
  };

  const handleSave = () => {
    // Remove "selected participants" if they are no longer in original participants list
    props.onSave(
      props.participants
        .filter((participant) => selectedParticipants.has(participant.id))
        .map((participant) => participant.id)
    );
  };

  const isSaveDisabled = () => {
    // Are all assigned participants still selected?
    for (const id of props.assignedParticipants) {
      if (!selectedParticipants.has(id)) {
        return false;
      }
    }
    // Are there any newly selected participants?
    for (const id of selectedParticipants) {
      if (!props.assignedParticipants.includes(id) && participantsInConference.has(id)) {
        return false;
      }
    }
    return true;
  };

  return (
    <Container fixed maxWidth="xs" disableGutters>
      <Title variant="body2">{t('room', { roomNumber: props.editingRoomIndex + 1 })}</Title>
      <Stack pl={1} pr={2} pb={1}>
        {props.participants.map(({ id, displayName }) => (
          <ParticipantCheckbox
            key={id}
            id={id}
            displayName={displayName}
            value={selectedParticipants.has(id)}
            onChange={handleCheckboxChange}
          />
        ))}
      </Stack>
      <ButtonGroup>
        <Button size="small" variant="text" onClick={props.onCancel} color="inherit">
          {t('user-selection-button-cancel')}
        </Button>
        <Button size="small" onClick={handleSave} color="secondary" disabled={isSaveDisabled()}>
          {t('user-selection-button-save')}
        </Button>
      </ButtonGroup>
    </Container>
  );
}
