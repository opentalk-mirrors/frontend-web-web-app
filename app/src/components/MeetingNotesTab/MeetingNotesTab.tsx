// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  styled,
  Checkbox,
  Typography,
  Button,
  Popover,
  InputAdornment,
  ListItem,
  List,
  FormControlLabel as MuiFormControlLabel,
  ListItemAvatar,
  ListItemText,
  Container,
  Stack,
  Grid,
} from '@mui/material';
import { cloneDeep, isEmpty, some, differenceBy, uniqueId } from 'lodash';
import { unionBy, intersectionBy } from 'lodash';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { deselectWriter, selectWriter, uploadPdf } from '../../api/types/outgoing/meetingNotes';
import { DoneIcon, SearchIcon } from '../../assets/icons';
import { ParticipantAvatar, CommonTextField } from '../../commonComponents';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { selectAllMeetingNotesParticipants } from '../../store/selectors';
import { selectMeetingNotesUrl } from '../../store/slices/meetingNotesSlice';
import { MeetingNotesParticipant } from '../../types';

const ParticipantSelectContainer = styled(Container)(({ theme }) => ({
  width: '19rem',
  backgroundColor: theme.palette.background.customPaper.primary,
  color: theme.palette.background.customPaper.contrastText,
  padding: theme.spacing(2),
}));

const ParticipantsListGrid = styled(Grid)({
  height: '20rem',
  overflowY: 'auto',
});

const FormControlLabel = styled(MuiFormControlLabel)(({ theme }) => ({
  flex: 1,
  marginLeft: 0,
  minWidth: 0,
  color: theme.palette.background.customPaper.contrastText,
  '& .MuiTypography-root': {
    flex: 1,
  },
}));

const SelectedParticipantsList = styled(List)({
  overflow: 'auto',
  width: '100%',
  flex: 1,
});

const MeetingNotesTab = () => {
  const [participants, setParticipants] = useState<MeetingNotesParticipant[]>([]);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const meetingNotesUrl = useAppSelector(selectMeetingNotesUrl);
  const [selectedParticipants, setSelectedParticipants] = useState<MeetingNotesParticipant[]>([]);
  const allMeetingNotesParticipants = useAppSelector(selectAllMeetingNotesParticipants);
  const [searchMask, setSearchMask] = useState('');
  const salt = React.useId();

  // List of selected participants with permission writes is stored locally, untill moderator pressed `Show meeting notes to all`
  // button. Only then we send all selected participants to the controller.
  // Therefore we need to preserve this state, if during the selection a `meeting notes` participant joins or leaves the conference.
  const mergeParticipants = (
    newParticipants: MeetingNotesParticipant[],
    oldParticipants: MeetingNotesParticipant[]
  ) => {
    let mergedParticipants: MeetingNotesParticipant[] = oldParticipants;
    const idProperty: keyof MeetingNotesParticipant = 'id';

    // Participants have joined the conference
    if (newParticipants.length > oldParticipants.length) {
      mergedParticipants = unionBy(oldParticipants, newParticipants, idProperty);
    }
    // Participants have left the conference
    if (newParticipants.length < oldParticipants.length) {
      mergedParticipants = intersectionBy(oldParticipants, newParticipants, idProperty);
    }

    return mergedParticipants;
  };

  const mergedParticipants = useMemo(
    () => mergeParticipants(allMeetingNotesParticipants, participants),
    [allMeetingNotesParticipants, participants]
  );
  const mergedSelectedParticipants = useMemo(
    () => mergeParticipants(allMeetingNotesParticipants, selectedParticipants),
    [allMeetingNotesParticipants, selectedParticipants]
  );

  const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSearchMask(event.target.value);
  }, []);

  const getFilteredParticipants = useCallback(() => {
    if (!isEmpty(searchMask)) {
      return mergedSelectedParticipants.filter((participant) =>
        participant.displayName.toString().toLocaleLowerCase().includes(searchMask.toString().toLocaleLowerCase())
      );
    }
    return mergedSelectedParticipants;
  }, [searchMask, mergedSelectedParticipants]);

  const checkAllHandler = useCallback(() => {
    const allChecked = mergedSelectedParticipants.every((participant) => participant.isSelected);
    const checkedArray = mergedSelectedParticipants.map((participant) => ({
      ...participant,
      isSelected: !allChecked,
    }));
    setSelectedParticipants(checkedArray);
  }, [mergedSelectedParticipants]);

  const checkHandler = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newParticipantsArray = mergedSelectedParticipants.map((participant) =>
        participant.id === event.target.id ? { ...participant, isSelected: event.target.checked } : participant
      );
      setSelectedParticipants(newParticipantsArray);
    },
    [mergedSelectedParticipants]
  );

  const sendInvitations = useCallback(() => {
    const participantComparator = (participant: MeetingNotesParticipant) => {
      return `${participant.id}${participant.isSelected}`;
    };
    const differentParticipants = meetingNotesUrl
      ? differenceBy(mergedParticipants, allMeetingNotesParticipants, participantComparator)
      : mergedParticipants;

    if (differentParticipants.length > 0) {
      const selectedParticipantIds = differentParticipants
        .filter((participant) => participant.isSelected)
        .map((participant) => participant.id);
      const deselectedParticipantIds = differentParticipants
        .filter((participant) => !participant.isSelected)
        .map((participant) => participant.id);
      if (selectedParticipantIds.length > 0) {
        dispatch(
          selectWriter.action({
            participantIds: selectedParticipantIds,
          })
        );
      }
      if (deselectedParticipantIds.length > 0) {
        dispatch(
          deselectWriter.action({
            participantIds: deselectedParticipantIds,
          })
        );
      }
    }
  }, [mergedParticipants, allMeetingNotesParticipants, dispatch, meetingNotesUrl]);

  const closeParticipantsListPanel = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const assignButtonHandler = useCallback(() => {
    setParticipants(mergedSelectedParticipants);
    closeParticipantsListPanel();
  }, [mergedSelectedParticipants, closeParticipantsListPanel]);

  const openParticipantsListPanel = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setSearchMask('');
      setSelectedParticipants(cloneDeep(mergedParticipants));
      setAnchorEl(event.currentTarget);
    },
    [mergedParticipants]
  );

  const uploadPdfAction = useCallback(() => {
    dispatch(uploadPdf.action());
  }, [dispatch]);

  const renderSelectedParticipantListItems = () => (
    <SelectedParticipantsList>
      {mergedParticipants
        .filter((participant) => participant.isSelected)
        .map((participant) => (
          <ListItem key={participant.id} sx={{ px: 0 }}>
            <ListItemAvatar>
              <ParticipantAvatar src={participant.avatarUrl}>{participant.displayName}</ParticipantAvatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography noWrap translate="no">
                  {participant.displayName}
                </Typography>
              }
            />
            <DoneIcon
              color="success"
              type="functional"
              title={t('meeting-notes-writer-selected-title')}
              titleId={uniqueId('meeting-notes-writer-selected-')}
            />
          </ListItem>
        ))}
    </SelectedParticipantsList>
  );

  const open = Boolean(anchorEl);
  const hasSelectedParticipants = some(mergedParticipants, 'isSelected');

  return (
    <Stack
      data-testid="meeting-notes-tab"
      spacing={2}
      direction="column"
      sx={{
        alignItems: 'center',
        flex: 1,
        overflow: 'hidden',
      }}
    >
      <Stack
        spacing={2}
        sx={{
          flex: 1,
          width: '100%',
          overflow: 'hidden',
          padding: 0.5,
        }}
      >
        <Button
          fullWidth
          onClick={openParticipantsListPanel}
          aria-label={meetingNotesUrl ? t('meeting-notes-edit-invite-button') : t('meeting-notes-invite-button')}
          id={`meeting-notes-popover-trigger-${salt}`}
          color="secondary"
        >
          {meetingNotesUrl ? t('meeting-notes-edit-invite-button') : t('meeting-notes-invite-button')}
        </Button>
        {renderSelectedParticipantListItems()}
      </Stack>
      <Stack
        direction="column"
        spacing={1}
        sx={{
          width: '100%',
          alignItems: 'center',
        }}
      >
        {meetingNotesUrl && (
          <Button
            fullWidth
            onClick={uploadPdfAction}
            aria-label={t('meeting-notes-upload-pdf-button')}
            color="secondary"
          >
            {t('meeting-notes-upload-pdf-button')}
          </Button>
        )}
        <Button
          fullWidth
          aria-label={
            meetingNotesUrl ? t('meeting-notes-update-invite-send-button') : t('meeting-notes-invite-send-button')
          }
          disabled={!hasSelectedParticipants}
          onClick={sendInvitations}
          color="secondary"
        >
          {meetingNotesUrl ? t('meeting-notes-update-invite-send-button') : t('meeting-notes-invite-send-button')}
        </Button>
      </Stack>
      <Popover
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 0,
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        open={open}
        onClose={closeParticipantsListPanel}
        slotProps={{
          paper: {
            role: 'dialog',
            'aria-labelledby': `meeting-notes-popover-trigger-${salt}`,
          },
        }}
      >
        <ParticipantSelectContainer disableGutters>
          <Stack spacing={2}>
            <CommonTextField
              size="small"
              onChange={(event) => handleSearch(event)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  autoFocus: true,
                },
              }}
              fullWidth
            />
            <Stack direction="row">
              <Button size="small" fullWidth onClick={checkAllHandler} color="secondary">
                {t('poll-participant-list-button-select-all')}
              </Button>
            </Stack>
            <ParticipantsListGrid>
              <List>
                {getFilteredParticipants().map((participant) => (
                  <ListItem key={participant.id}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={participant.isSelected}
                          id={participant.id}
                          onChange={checkHandler}
                          color="secondary"
                        />
                      }
                      label={
                        <Typography noWrap translate="no" component="span">
                          {participant.displayName}
                        </Typography>
                      }
                      labelPlacement="start"
                    />
                  </ListItem>
                ))}
              </List>
            </ParticipantsListGrid>
            <Stack
              direction="row"
              spacing={2}
              sx={{
                justifyContent: 'space-between',
              }}
            >
              <Button variant="text" onClick={closeParticipantsListPanel} color="secondary">
                {t('poll-participant-list-button-close')}
              </Button>
              <Button onClick={assignButtonHandler} color="secondary">
                {t('poll-participant-list-button-select')}
              </Button>
            </Stack>
          </Stack>
        </ParticipantSelectContainer>
      </Popover>
    </Stack>
  );
};

export default MeetingNotesTab;
