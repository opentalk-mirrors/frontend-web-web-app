// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Stack, styled } from '@mui/material';
import { debounce } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import { LastSeenTimestampAddedPayload, setLastSeenTimestamp } from '../../api/types/outgoing/chat';
import { useAppSelector } from '../../hooks';
import { getCurrentConferenceRoom } from '../../modules/WebRTC/ConferenceRoom';
import { lastSeenTimestampAdded, selectLastMessageForScope } from '../../store/slices/chatSlice';
import { selectIsRoomDeleted } from '../../store/slices/roomSlice';
import {
  selectChatConversationScope,
  selectChatConversationTargetId,
  selectChatSearchValue,
  setChatSearchValue,
} from '../../store/slices/uiSlice';
import { BreakoutRoomId, ChatMessage, ChatScope, GroupId, ParticipantId, Timestamp } from '../../types';
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
  autoFocusMessageInput?: boolean;
}

const Chat = ({ autoFocusMessageInput }: ChatProps) => {
  // Default value is used when we switch tabs and component remounts.
  const defaultChatValue = useAppSelector(selectChatSearchValue);
  const isRoomDeleted = useAppSelector(selectIsRoomDeleted);
  const [searchValue, setSearchValue] = useState<string>(defaultChatValue);
  const dispatch = useDispatch();
  const chatSearchInputReference = useRef<HTMLInputElement | null>(null);
  const scope = useAppSelector(selectChatConversationScope);
  const target = useAppSelector(selectChatConversationTargetId);
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
      case ChatScope.Breakout:
        return { scope, timestamp, target: target as BreakoutRoomId };
    }
  }, []);

  const debouncedSetLastSeenTimestamp = useMemo(
    () =>
      debounce((message: LastSeenTimestampAddedPayload) => {
        if (getCurrentConferenceRoom() === undefined) {
          return;
        }
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
        if (getCurrentConferenceRoom() === undefined) {
          return;
        }
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
      <ChatList onReset={resetSearch} />
      <ChatForm autoFocusMessageInput={autoFocusMessageInput} />
      {/* Currently we want to announce only global chat messages */}
      {scope === ChatScope.Global && <ChatLiveRegion />}
    </Container>
  );
};

export default Chat;
