// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  styled,
  Checkbox,
  Typography,
  Button,
  Container,
  Grid,
  InputAdornment,
  ListItem as MuiListItem,
  List,
  ListItemText,
  ListItemAvatar as MuiListItemAvatar,
  FormHelperText,
} from '@mui/material';
import { useFormikContext } from 'formik';
import { find, debounce } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SearchIcon } from '../../../assets/icons';
import { ParticipantAvatar, CommonTextField } from '../../../commonComponents';
import { useAppSelector } from '../../../hooks';
import { selectVotingUsers } from '../../../store/selectors';
import { ParticipantId } from '../../../types';

interface IParticipantSelectorProps {
  name: string;
}

const ListItem = styled(MuiListItem)(({ theme }) => ({
  padding: theme.spacing(1, 0, 1, 0),
  cursor: 'pointer',
  '& .more-icon': {
    color: 'transparent',
  },
  ':hover': {
    opacity: 0.8,
    '& .more-icon': {
      color: theme.palette.text.primary,
    },
  },
}));

const CustomList = styled(List)({
  flex: '1 1 auto',
  overflowY: 'auto',
  textAlign: 'left',
  width: '100%',
});

const ListItemAvatar = styled(MuiListItemAvatar)({
  minWidth: 'initial',
});

export interface AllowedParticipant {
  displayName: string;
  avatarUrl?: string;
  id: ParticipantId;
  isSelected?: boolean;
}

const isSelectedParticipant = (participants: AllowedParticipant[], id: ParticipantId) =>
  Boolean(find(participants, { id })?.isSelected);

const getSelectedParticipants = (participants: AllowedParticipant[]) =>
  participants.filter((participant) => participant.isSelected);

const ParticipantSelector = ({ name }: IParticipantSelectorProps) => {
  const { t } = useTranslation();

  const votingUsers = useAppSelector(selectVotingUsers);

  const participantsWithoutGuestAndSip = useMemo(() => votingUsers || [], [votingUsers]);
  const { setFieldValue, validateField } = useFormikContext();
  const [selectedIds, setSelectedIds] = useState<ParticipantId[]>([]);
  const [searchValue, setSearchValue] = useState('');

  const allowedParticipants: AllowedParticipant[] = useMemo(
    () =>
      participantsWithoutGuestAndSip.map(({ displayName, avatarUrl, id }: AllowedParticipant) => ({
        displayName,
        avatarUrl,
        id,
        isSelected: selectedIds.includes(id),
      })),
    [participantsWithoutGuestAndSip, selectedIds]
  );

  const participantsToShow: AllowedParticipant[] = useMemo(
    () =>
      searchValue
        ? allowedParticipants.filter((participant) => participant.displayName.toLowerCase().includes(searchValue))
        : allowedParticipants,
    [allowedParticipants, searchValue]
  );

  const searchHandler = useMemo(
    () =>
      debounce((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setSearchValue(e.target.value.toLowerCase());
      }, 250),
    []
  );

  useEffect(() => {
    validateField(name);
  }, [name, validateField]);

  useEffect(() => {
    return () => {
      searchHandler.cancel();
    };
  }, [searchHandler]);

  const checkAllHandler = () => {
    setSelectedIds((prevSelected) => {
      const shouldSelectAll = participantsWithoutGuestAndSip.some(
        (participant) => !prevSelected.includes(participant.id)
      );
      const nextSelected = shouldSelectAll ? participantsWithoutGuestAndSip.map((participant) => participant.id) : [];
      const updatedParticipants = participantsWithoutGuestAndSip.map(
        ({ displayName, avatarUrl, id }: AllowedParticipant) => ({
          displayName,
          avatarUrl,
          id,
          isSelected: nextSelected.includes(id),
        })
      );

      setFieldValue(name, getSelectedParticipants(updatedParticipants));
      return nextSelected;
    });
  };

  const checkParticipantHandler = (id: ParticipantId) => {
    setSelectedIds((prevSelected) => {
      const isSelected = prevSelected.includes(id);
      const nextSelected = isSelected ? prevSelected.filter((selectedId) => selectedId !== id) : [...prevSelected, id];
      const updatedParticipants = participantsWithoutGuestAndSip.map(
        ({ displayName, avatarUrl, id }: AllowedParticipant) => ({
          displayName,
          avatarUrl,
          id,
          isSelected: nextSelected.includes(id),
        })
      );

      setFieldValue(name, getSelectedParticipants(updatedParticipants));
      return nextSelected;
    });
  };

  const renderSearchUser = (
    <Grid size={{ xs: 12 }}>
      <CommonTextField
        size="small"
        onChange={searchHandler}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          },
        }}
        fullWidth
      />
    </Grid>
  );

  const renderAllUsersButton = (
    <Grid
      size={{ xs: 12 }}
      sx={{
        display: 'flex',
      }}
    >
      <Button onClick={checkAllHandler} fullWidth color="secondary">
        {t('poll-participant-list-button-select-all')}
      </Button>
    </Grid>
  );

  const renderParticipant = (participant: AllowedParticipant) => (
    <ListItem key={participant.id} onClick={() => checkParticipantHandler(participant.id)}>
      <Grid container spacing={2} direction="row" wrap="nowrap" sx={{ flexGrow: 1 }}>
        <Grid>
          <ListItemAvatar>
            <ParticipantAvatar src={participant.avatarUrl}>{participant.displayName}</ParticipantAvatar>
          </ListItemAvatar>
        </Grid>
        <Grid size="grow">
          <ListItemText primary={<Typography noWrap>{participant.displayName}</Typography>} />
        </Grid>
        <Grid
          sx={{
            alignContent: 'flex-end',
          }}
        >
          <Checkbox
            checked={isSelectedParticipant(allowedParticipants, participant.id)}
            id={participant.id}
            color="secondary"
          />
        </Grid>
      </Grid>
    </ListItem>
  );

  const renderParticipants = (
    <Grid size="grow">
      <CustomList>{participantsToShow.map(renderParticipant)}</CustomList>
    </Grid>
  );

  return (
    <Container disableGutters>
      <Grid container spacing={2} direction="column">
        {renderSearchUser}
        {renderAllUsersButton}
        <FormHelperText>{t('legal-vote-input-assignments-required')}</FormHelperText>
        {renderParticipants}
      </Grid>
    </Container>
  );
};

export default ParticipantSelector;
