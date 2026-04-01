// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { memo, useCallback } from 'react';

import { useAppDispatch, useAppSelector } from '../../../hooks';
import { selectPeopleTabParticipants } from '../../../store/selectors';
import { selectParticipantsSearchValue, setParticipantsSearchValue } from '../../../store/slices/uiSlice';
import ParticipantSimpleList from './ParticipantSimpleList';
import SearchTextField from './SearchTextField';

const CachedSearchTextField = memo(SearchTextField);

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
      <CachedSearchTextField searchValue={searchValue} onSearch={dispatchNextSearchValue} fullWidth showSort />
      <ParticipantSimpleList participants={participants} />
    </>
  );
};

export default memo(ParticipantsContainer);
