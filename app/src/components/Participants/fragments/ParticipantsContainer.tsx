// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { memo, useCallback } from 'react';

import { useAppDispatch, useAppSelector } from '../../../hooks';
import {
  selectParticipantsSearchValue,
  selectShowParticipantGroups,
  setParticipantsSearchValue,
} from '../../../store/slices/uiSlice';
import ParticipantGroupingForm from './ParticipantGroupingForm';
import ParticipantGroups from './ParticipantGroups';
import ParticipantNoGroups from './ParticipantNoGroups';
import SearchTextField from './SearchTextField';

const CachedSearchTextField = memo(SearchTextField);

const ParticipantsContainer = () => {
  const dispatch = useAppDispatch();
  const groupParticipantsEnabled = useAppSelector(selectShowParticipantGroups);
  const searchValue = useAppSelector(selectParticipantsSearchValue);

  const dispatchNextSearchValue = useCallback(
    (nextSearchValue: string) => {
      dispatch(setParticipantsSearchValue(nextSearchValue));
    },
    [dispatch]
  );

  return (
    <>
      <CachedSearchTextField searchValue={searchValue} onSearch={dispatchNextSearchValue} fullWidth showSort />
      <ParticipantGroupingForm />
      {groupParticipantsEnabled ? <ParticipantGroups flex={1} /> : <ParticipantNoGroups />}
    </>
  );
};

export default memo(ParticipantsContainer);
