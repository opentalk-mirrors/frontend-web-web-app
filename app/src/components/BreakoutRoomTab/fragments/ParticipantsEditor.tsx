// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel as MuiFormControlLabel,
  Popover,
  styled,
  Typography,
  useTheme,
} from '@mui/material';
import { concat, intersectionBy } from 'lodash';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Participant } from '../../../types';

interface IParticipantsEditorProps {
  onChange: (participants: Participant[]) => void;
  assignedParticipants: Participant[];
  unAssignedParticipants: Participant[];
  title: string;
}

const FormControlLabel = styled(MuiFormControlLabel)({
  justifyContent: 'space-between',
  marginLeft: 0,
  marginRight: 0,
});

const ParticipantContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  maxHeight: 200,
  width: '17.875rem',
  overflowY: 'scroll',
  padding: theme.spacing(0, 1, 2, 2),
}));

const ButtonGroup = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(1.25, 2),
  borderTop: '1px solid #385865',
}));

const Title = styled(Typography)(({ theme }) => ({
  margin: theme.spacing(2),
  padding: theme.spacing(1),
  borderRadius: 6,
  backgroundColor: theme.palette.background.highlight.primary,
}));

const CustomEditButton = styled(Button)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.background.main.primary,
    color: theme.palette.background.main.contrastText,
  },
}));

const ParticipantsEditor = ({
  onChange,
  assignedParticipants,
  unAssignedParticipants,
  title,
}: IParticipantsEditorProps) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [selectedParticipants, setSelectedParticipants] = React.useState<Participant[]>(assignedParticipants);
  const { t } = useTranslation();
  const theme = useTheme();

  const availableParticipants = useMemo(
    () => [...assignedParticipants, ...unAssignedParticipants],
    [assignedParticipants, unAssignedParticipants]
  );

  const participantsToAssign = useMemo(
    () => intersectionBy(availableParticipants, selectedParticipants, 'id'),
    [availableParticipants, selectedParticipants]
  );

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setSelectedParticipants(intersectionBy(availableParticipants, assignedParticipants, 'id'));
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(null);
  };

  const handleOnChangeParticipant = (event: React.ChangeEvent<HTMLInputElement>, participant: Participant) => {
    event.stopPropagation();
    const checked = event.target.checked;
    if (checked) {
      setSelectedParticipants((prevSelected) => {
        return prevSelected.some((p) => p.id === participant.id) ? prevSelected : concat(prevSelected, participant);
      });
    } else {
      setSelectedParticipants((prevSelected) => prevSelected.filter((p) => p.id !== participant.id));
    }
  };

  const handleSaveParticipants = () => {
    onChange(participantsToAssign);
    setAnchorEl(null);
  };

  const renderParticipants = (participants: Participant[]) => {
    if (participants.length === 0) {
      return <span>━</span>;
    }

    return participants.map((participant) => (
      <FormControlLabel
        key={participant.id}
        control={
          <Checkbox
            checked={
              participantsToAssign.findIndex((participantToAssign) => participantToAssign.id === participant.id) !== -1
            }
            id={participant.id}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleOnChangeParticipant(event, participant)}
            color={theme.palette.mode === 'light' ? 'primary' : 'secondary'}
          />
        }
        translate="no"
        label={participant.displayName}
        labelPlacement="start"
      />
    ));
  };

  const open = Boolean(anchorEl);

  return (
    <Box position="absolute" top={8} right={4}>
      <CustomEditButton
        size="small"
        variant="text"
        onClick={handlePopoverOpen}
        color={theme.palette.mode === 'light' ? 'primary' : 'secondary'}
      >
        {t('user-editor-button-edit')}
      </CustomEditButton>
      <Popover
        open={open}
        onClose={handlePopoverClose}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        keepMounted={false}
      >
        <Title variant="body2">{title}</Title>
        <ParticipantContainer>
          <Typography variant="caption">{`${t('user-selection-not-assigned-users')}:`}</Typography>
          {renderParticipants(unAssignedParticipants)}
          <Typography variant="caption">{`${t('user-selection-assigned-users')}:`}</Typography>
          {renderParticipants(assignedParticipants)}
        </ParticipantContainer>
        <ButtonGroup>
          <Button size="small" variant="text" onClick={handlePopoverClose} color="inherit">
            {t('user-selection-button-cancel')}
          </Button>
          <Button size="small" onClick={handleSaveParticipants} color="secondary">
            {t('user-selection-button-save')}
          </Button>
        </ButtonGroup>
      </Popover>
    </Box>
  );
};

export default ParticipantsEditor;
