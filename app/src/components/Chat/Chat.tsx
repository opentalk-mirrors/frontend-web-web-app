// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Stack, styled } from '@mui/material';
import { debounce } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import { LastSeenTimestampAddedPayload, setLastSeenTimestamp } from '../../api/types/outgoing/chat';
import { useAppSelector } from '../../hooks';
import { lastSeenTimestampAdded, selectLastMessageForScope } from '../../store/slices/chatSlice';
import { selectChatSearchValue, setChatSearchValue } from '../../store/slices/uiSlice';
import { ChatScope, TargetId } from '../../types';
import ChatForm from './fragments/ChatForm';
import ChatList from './fragments/ChatList';
import ChatSearch from './fragments/ChatSearch';

const Container = styled(Stack)({
  flex: 1,
  overflow: 'hidden',
  width: '100%',
});

interface ChatProps {
  scope: ChatScope;
  target?: TargetId;
  autoFocusMessageInput?: boolean;
}

const Chat = ({ target, scope, autoFocusMessageInput }: ChatProps) => {
  // Default value is used when we switch tabs and component remounts.
  const defaultChatValue = useAppSelector(selectChatSearchValue);
  const [searchValue, setSearchValue] = useState<string>(defaultChatValue);
  const dispatch = useDispatch();
  const chatSearchInputReference = useRef<HTMLInputElement | null>(null);
  const lastMessageForScope = useAppSelector(selectLastMessageForScope(scope, target));

  //Adds a last seen timestamp when the specific scope is opened or a message in the scope is received while open
  useEffect(() => {
    const timestamp = lastMessageForScope ? lastMessageForScope.timestamp : new Date().toISOString();
    const payload: LastSeenTimestampAddedPayload = { scope, timestamp, target };
    dispatch(lastSeenTimestampAdded(payload));
    dispatch(setLastSeenTimestamp.action(payload));
  }, [lastMessageForScope, dispatch, scope, target]);

  const debouncedSetChatSearchValue = useCallback(
    debounce((value: string) => {
      dispatch(setChatSearchValue(value));
    }, 150),
    []
  );

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
    </Container>
  );
};

Chat.defaultProps = {
  scope: ChatScope.Global,
};

export default Chat;
