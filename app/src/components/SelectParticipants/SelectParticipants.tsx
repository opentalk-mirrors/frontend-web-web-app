// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Autocomplete, CircularProgress, InputAdornment, TextField, styled } from '@mui/material';
import { EventInvite } from '@opentalk/rest-api-rtk-query';
import type { EventId, User, EmailUser, Email, ParticipantOption } from '@opentalk/rest-api-rtk-query';
import { debounce, differenceBy } from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useGetEventInvitesQuery, useGetMeQuery, useLazyFindUsersQuery } from '../../api/rest';
import { CopyIcon, SearchIcon } from '../../assets/icons';
import { useAppSelector } from '../../hooks';
import { selectLibravatarDefaultImage } from '../../store/slices/configSlice';
import { EmailStrategy } from './fragments/EmailStrategy';
import { SuggestedUserStrategy } from './fragments/SuggestedUserStrategy';

type SelectParticipantsProps = {
  label?: string;
  placeholder?: string;
  invitees?: Array<EventInvite>;
  selectedUsers?: Array<ParticipantOption>;
  onParticipantSelect: (selectedUser: ParticipantOption) => void;
  eventId: EventId;
};

const AutocompleteTextField = styled(TextField)(({ theme }) => ({
  '.MuiInputBase-root': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  '.MuiInputBase-root.Mui-focused': {
    backgroundColor: theme.palette.background.highlight.primary,
    color: theme.palette.background.highlight.contrastText,
  },
  '& .MuiSvgIcon-root': {
    color: 'inherit',
  },
  '& .MuiInputBase-input::placeholder': {
    opacity: 1,
  },
}));

const SelectParticipants = ({
  onParticipantSelect,
  label,
  placeholder,
  selectedUsers = [],
  eventId,
}: SelectParticipantsProps) => {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState('');
  const avatarDefaultImage = useAppSelector(selectLibravatarDefaultImage);
  const { data: invitees = [] } = useGetEventInvitesQuery({ eventId }, { refetchOnMountOrArgChange: true });

  const { myEmail } = useGetMeQuery(undefined, {
    selectFromResult: ({ data }) => ({
      myEmail: data?.email,
    }),
  });

  const [findUsers, { isLoading, foundUsers }] = useLazyFindUsersQuery({
    selectFromResult: ({ data, ...props }) => ({
      foundUsers: data?.filter((user) => user.email !== myEmail),
      ...props,
    }),
  });

  const debounceFindUsers = useCallback(
    debounce((inputValue: string) => {
      inputValue.length > 2 && findUsers({ q: inputValue });
    }, 250),
    [findUsers]
  );

  const suggestedParticipants: Array<User> = useMemo(() => {
    if (isLoading || searchValue.length < 3) {
      return [];
    }
    const invitedUsers = invitees?.map((invited) => invited.profile) || [];

    return differenceBy(foundUsers, invitedUsers, selectedUsers, 'email').sort((a, b) => {
      const aName = `${a.firstname} ${a.lastname}`;
      const bName = `${b.firstname} ${b.lastname}`;
      return aName.localeCompare(bName);
    });
  }, [isLoading, foundUsers, selectedUsers, searchValue, invitees?.map]);

  const hasParticipantsSuggestion = suggestedParticipants?.length > 0;

  const searchEntryHandler = useCallback(
    (inputValue: string) => {
      setSearchValue(inputValue);
      debounceFindUsers(inputValue);
    },
    [debounceFindUsers]
  );

  const handleSelect = (selectedUser: ParticipantOption) => {
    onParticipantSelect(selectedUser);
    setSearchValue('');
  };

  const emailSuggestions: Array<EmailUser> = useMemo(() => {
    const lowercaseSearchValue = searchValue.toLowerCase();
    if (
      !(
        selectedUsers.find((user) => user.email === lowercaseSearchValue) ||
        invitees.find((invitee) => invitee.profile.email === lowercaseSearchValue)
      )
    ) {
      return [{ email: lowercaseSearchValue as Email }];
    }
    return [];
  }, [searchValue, selectedUsers, invitees]);

  //Autocomplete's native behavior is like <select> where on click it sets the element as the input text.
  //We manually override that with value={null} and using the local searchValue as the input text, which is cleared after each selection.
  return (
    <Autocomplete
      data-testid="SelectParticipants"
      options={hasParticipantsSuggestion ? suggestedParticipants : emailSuggestions}
      getOptionLabel={hasParticipantsSuggestion ? SuggestedUserStrategy.getOptionLabel : EmailStrategy.getOptionLabel}
      renderOption={
        hasParticipantsSuggestion
          ? SuggestedUserStrategy.renderOption(avatarDefaultImage)
          : EmailStrategy.renderOption(t('global-no-result'))
      }
      inputValue={searchValue || ''}
      value={null}
      clearOnEscape={true}
      onChange={(_, value) => value && handleSelect(value)}
      onInputChange={(_, value) => searchEntryHandler(value || '')}
      noOptionsText={t('global-no-result')}
      loading={isLoading}
      open={!isLoading && (hasParticipantsSuggestion || searchValue.length > 2)}
      renderInput={({ InputProps, ...params }) => (
        <AutocompleteTextField
          {...params}
          placeholder={placeholder}
          label={label}
          variant="outlined"
          slotProps={{
            input: {
              ...InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon aria-label={t('dashboard-select-participants-label-search')}>
                    <CopyIcon />
                  </SearchIcon>
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {isLoading ? <CircularProgress color="inherit" size={16} /> : null}
                </InputAdornment>
              ),
            },
          }}
        />
      )}
    />
  );
};

export default SelectParticipants;
