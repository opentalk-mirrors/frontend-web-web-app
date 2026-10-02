// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, styled } from '@mui/material';
import { memo, useCallback } from 'react';

import { useAppDispatch, useAppSelector } from '../../../hooks';
import { selectPeopleTabParticipants } from '../../../store/selectors';
import { selectParticipantsSearchValue, setParticipantsSearchValue } from '../../../store/slices/uiSlice';
import ParticipantSimpleList from './ParticipantSimpleList';
import SearchTextField from './SearchTextField';

const CachedSearchTextField = memo(SearchTextField);

const SearchContainer = styled(Box)({
  flexShrink: 0,
});

const ListContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  minHeight: 0,
  paddingTop: theme.spacing(1),
}));

const ParticipantsContainer = () => {
  const dispatch = useAppDispatch();
  const searchValue = useAppSelector(selectParticipantsSearchValue);
  const participants = useAppSelector(selectPeopleTabParticipants);

  const dispatchNextSearchValue = useCallback(
    (nextSearchValue: string) => {
      dispatch(setParticipantsSearchValue(nextSearchValue));
    },
    [dispatch]
  );

  return (
    <>
      <SearchContainer>
        <CachedSearchTextField searchValue={searchValue} onSearch={dispatchNextSearchValue} fullWidth showSort />
      </SearchContainer>
      <ListContainer>
        <ParticipantSimpleList participants={participants} />
      </ListContainer>
    </>
  );
};

export default memo(ParticipantsContainer);
