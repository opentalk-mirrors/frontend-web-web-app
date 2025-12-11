// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Stack, styled } from '@mui/material';
import { debounce } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import { LastSeenTimestampAddedPayload, setLastSeenTimestamp } from '../../api/types/outgoing/chat';
import { useAppSelector } from '../../hooks';
import { lastSeenTimestampAdded, selectLastMessageForScope } from '../../store/slices/chatSlice';
import { selectIsRoomDeleted } from '../../store/slices/roomSlice';
import { selectChatSearchValue, setChatSearchValue } from '../../store/slices/uiSlice';
import { ChatMessage, ChatScope, GroupId, ParticipantId, TargetId, Timestamp } from '../../types';
import ChatForm from './fragments/ChatForm';
import ChatList from './fragments/ChatList';
import ChatLiveRegion from './fragments/ChatLiveRegion';
import ChatSearch from './fragments/ChatSearch';

const Container = styled(Stack)({
  flex: 1,
  overflow: 'hidden',
  width: '100%',
});

interface ChatProps {
  scope?: ChatScope;
  target?: TargetId;
  autoFocusMessageInput?: boolean;
}

const Chat = ({ target, scope = ChatScope.Global, autoFocusMessageInput }: ChatProps) => {
  // Default value is used when we switch tabs and component remounts.
  const defaultChatValue = useAppSelector(selectChatSearchValue);
  const isRoomDeleted = useAppSelector(selectIsRoomDeleted);
  const [searchValue, setSearchValue] = useState<string>(defaultChatValue);
  const dispatch = useDispatch();
  const chatSearchInputReference = useRef<HTMLInputElement | null>(null);
  const lastMessageForScope = useAppSelector((state) => selectLastMessageForScope(state, scope, target));

  const constructLastSeenPayload = useCallback((lastMessageForScope: ChatMessage): LastSeenTimestampAddedPayload => {
    const { scope, target } = lastMessageForScope;
    const timestamp = lastMessageForScope.timestamp as Timestamp;

    switch (scope) {
      case ChatScope.Global:
        return { scope, timestamp };
      case ChatScope.Private:
        return { scope, timestamp, target: target as ParticipantId };
      case ChatScope.Group:
        return { scope, timestamp, target: target as GroupId };
    }
  }, []);

  const debouncedSetLastSeenTimestamp = useMemo(
    () =>
      debounce((message: LastSeenTimestampAddedPayload) => {
        dispatch(setLastSeenTimestamp.action(message));
      }, 1000),
    [dispatch]
  );

  useEffect(() => {
    return () => debouncedSetLastSeenTimestamp.cancel();
  }, [debouncedSetLastSeenTimestamp]);

  // Adds a last seen timestamp when the specific scope is opened or a message in the scope is received while open
  useEffect(() => {
    if (!isRoomDeleted && lastMessageForScope) {
      const message = constructLastSeenPayload(lastMessageForScope);

      dispatch(lastSeenTimestampAdded(message));
      debouncedSetLastSeenTimestamp(message);
    }
  }, [dispatch, lastMessageForScope, debouncedSetLastSeenTimestamp, constructLastSeenPayload, isRoomDeleted]);

  const debouncedSetChatSearchValue = useMemo(
    () =>
      debounce((value: string) => {
        dispatch(setChatSearchValue(value));
      }, 150),
    [dispatch]
  );

  useEffect(() => {
    return () => debouncedSetChatSearchValue.cancel();
  }, [debouncedSetChatSearchValue]);

  const onChangeMiddleware = (nextSearchValue: string) => {
    setSearchValue(nextSearchValue);
    debouncedSetChatSearchValue(nextSearchValue);
  };

  const resetSearch = () => {
    setSearchValue('');
    dispatch(setChatSearchValue(''));
    if (chatSearchInputReference.current) {
      chatSearchInputReference.current.focus();
    }
  };

  return (
    <Container data-testid="chat" spacing={1} sx={{ pt: 0.7 }}>
      <ChatSearch value={searchValue} onChange={onChangeMiddleware} ref={chatSearchInputReference} />
      <ChatList scope={scope} targetId={target} onReset={resetSearch} />
      <ChatForm scope={scope} targetId={target} autoFocusMessageInput={autoFocusMessageInput} />
      {/* Currently we want to announce only global chat messages */}
      {scope === ChatScope.Global && <ChatLiveRegion />}
    </Container>
  );
};

export default Chat;
