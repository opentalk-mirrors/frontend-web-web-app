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
  FormHelperText,
  ListItemAvatar as MuiListItemAvatar,
} from '@mui/material';
import { useFormikContext } from 'formik';
import { get, find, debounce } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
      color: theme.palette.primary.contrastText,
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

  const pantansWithoutGuestAndSip = votingUsers || [];
  const { setFieldValue, errors } = useFormikContext();
  const error = get(errors, name, '') as string;
  const hasError = Boolean(error);
  const [allowedParticipants, setAlloedParticipants] = useState<AllowedParticipant[]>([]);

  useEffect(() => {
    setAlloedParticipants((allowedParticipants) =>
      pantansWithoutGuestAndSip.map(({ displayName, avatarUrl, id }: AllowedParticipant) => ({
        displayName,
        avatarUrl,
        id,
        isSelected: isSelectedParticipant(allowedParticipants, id),
      }))
    );
  }, [pantansWithoutGuestAndSip]);

  const [participantsSought, setParticipantsSought] = useState<AllowedParticipant[]>([]);

  const participantsToShow: AllowedParticipant[] = useMemo(
    () => (participantsSought.length > 0 ? participantsSought : allowedParticipants),
    [participantsSought, allowedParticipants]
  );

  const searchHandler = useCallback(
    debounce((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setParticipantsSought(() =>
        e.target.value
          ? allowedParticipants.filter((participant) =>
              participant.displayName.toLowerCase().includes(e.target.value.toLowerCase())
            )
          : allowedParticipants
      );
    }, 250),
    [allowedParticipants]
  );

  const checkAllHandler = () => {
    const someIsFalse = allowedParticipants.some((participant) => participant.isSelected === false);

    const newStateParticipants = allowedParticipants.map((participant) => ({
      ...participant,
      isSelected: someIsFalse,
    }));

    setAlloedParticipants(newStateParticipants);

    setFieldValue(name, getSelectedParticipants(newStateParticipants));
  };

  const checkParticipantHandler = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const newStateParticipants = allowedParticipants;
    const participantIndex = newStateParticipants.findIndex((participant) => participant.id === id);

    newStateParticipants[participantIndex].isSelected = e.target.checked;

    setAlloedParticipants(newStateParticipants);

    setFieldValue(
      name,
      newStateParticipants.filter((participant) => participant.isSelected)
    );
  };

  const renderErrors = hasError && (
    <Grid item>
      <FormHelperText error={hasError}>{error}</FormHelperText>
    </Grid>
  );

  const renderSearchUser = (
    <Grid item xs={12}>
      <CommonTextField
        size="small"
        onChange={searchHandler}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        fullWidth
      />
    </Grid>
  );

  const renderAllUsersButton = (
    <Grid item xs={12} display="flex">
      <Button onClick={checkAllHandler} fullWidth>
        {t('poll-participant-list-button-select-all')}
      </Button>
    </Grid>
  );

  const renderParticipant = (participant: AllowedParticipant) => (
    <ListItem key={participant.id}>
      <Grid container spacing={2} direction="row" wrap="nowrap">
        <Grid item>
          <ListItemAvatar>
            <ParticipantAvatar src={participant.avatarUrl}>{participant.displayName}</ParticipantAvatar>
          </ListItemAvatar>
        </Grid>
        <Grid item xs zeroMinWidth>
          <ListItemText primary={<Typography noWrap>{participant.displayName}</Typography>} />
        </Grid>
        <Grid item alignContent="flex-end">
          <Checkbox
            checked={isSelectedParticipant(allowedParticipants, participant.id)}
            id={participant.id}
            onChange={(e) => checkParticipantHandler(e, participant.id)}
            color="primary"
          />
        </Grid>
      </Grid>
    </ListItem>
  );

  const renderPartricipants = (
    <Grid item xs={12}>
      <CustomList>{participantsToShow.map(renderParticipant)}</CustomList>
    </Grid>
  );

  return (
    <Container disableGutters>
      <Grid container spacing={2} padding={1}>
        {renderErrors}
        {renderSearchUser}
        {renderAllUsersButton}
        {renderPartricipants}
      </Grid>
    </Container>
  );
};

export default ParticipantSelector;
