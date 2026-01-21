// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, CircularProgress, List, ListItem, Stack, Typography, styled } from '@mui/material';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ViewportList, ViewportListRef } from 'react-viewport-list';

import { getHistoryChunk, searchHistory } from '../../../api/types/outgoing/chat';
import { EncryptedMessagesIcon } from '../../../assets/icons';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { useChatScroll } from '../../../hooks/useChatScroll';
import { selectCombinedMessageAndEvents, selectNextIndex } from '../../../store/selectors';
import {
  selectChatSearchResults,
  selectIsLoadingMoreChunks,
  setGlobalChatLastSeenTimestamp,
  setIsLoadingMoreChunks,
  setLastSeenTimestampForGroupChat,
  setLastSeenTimestampForPrivateChat,
  setLastSeenTimestampForBreakoutChat,
} from '../../../store/slices/chatSlice';
import type { RoomEvent } from '../../../store/slices/eventSlice';
import { selectIsRoomDeleted } from '../../../store/slices/roomSlice';
import {
  selectChatConversationScope,
  selectChatConversationTargetId,
  selectChatSearchValue,
} from '../../../store/slices/uiSlice';
import { selectOurUuid } from '../../../store/slices/userSlice';
import { ChatMessage as ChatMessageType, ChatScope, GroupId, ParticipantId, Timestamp } from '../../../types';
import ChatMessage from './ChatMessage';
import NoSearchResult from './NoSearchResult';

const StyledEncryptedMessagesIcon = styled(EncryptedMessagesIcon)({
  '&.MuiSvgIcon-root': {
    width: '4.7em',
    height: '4.7em',
  },
});

const ChatOrderedList = styled(List, {
  shouldForwardProp: (prop) => prop !== 'empty',
})<{ empty?: boolean }>(({ theme, empty }) => ({
  flex: '1 1 auto',
  overflowY: 'auto',
  height: 0,
  textAlign: 'left',
  width: '100%',
  paddingRight: theme.spacing(1),
  paddingBottom: theme.spacing(0),
  display: empty ? 'none' : 'block',
  willChange: 'transform', // Performance has been tested with and without this property and observed significant smoothness when used.
}));

type ChatListProps = {
  onReset?: () => void;
};

function filterMessages(
  messages: Array<ChatMessageType | RoomEvent>,
  searchValue: string,
  chatSearchResults: ChatMessageType[]
): ChatMessageType[] {
  if (!searchValue) {
    return messages as ChatMessageType[];
  }

  const lowerSearch = searchValue.toLowerCase();
  const resultsMap = new Map(chatSearchResults.map((msg) => [msg.id, msg]));

  messages.forEach((record) => {
    // TODO: naive approach that fails for languages such as turkish, spanish, french
    // as we cannot search for words such as "mañana" with "manana" or "Günaydın" with "gunaydin".
    // this should be extended if we start introducing new languages. One potential solution
    // would be to use `locale-index-of` npm package.
    if (!('event' in record) && record.content.toLowerCase().includes(lowerSearch)) {
      resultsMap.set(record.id, record);
    }
  });

  return Array.from(resultsMap.values());
}

const ChatList = ({ onReset }: ChatListProps) => {
  const { t } = useTranslation();
  const combinedMessageAndEvents = useAppSelector(selectCombinedMessageAndEvents);
  const scope = useAppSelector(selectChatConversationScope);
  const targetId = useAppSelector(selectChatConversationTargetId);
  const nextIndex = useAppSelector(selectNextIndex);
  const isLoadingMoreChunks = useAppSelector(selectIsLoadingMoreChunks);
  const chatSearchResults = useAppSelector(selectChatSearchResults);
  const chatSearchValue = useAppSelector(selectChatSearchValue);
  const isRoomDeleted = useAppSelector(selectIsRoomDeleted);
  const dispatch = useAppDispatch();
  const virtualList = useRef<ViewportListRef | null>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);
  const ourUuid = useAppSelector(selectOurUuid);

  const searchedMessages = useMemo(
    () => filterMessages(combinedMessageAndEvents, chatSearchValue, chatSearchResults),
    [combinedMessageAndEvents, chatSearchValue, chatSearchResults]
  );

  const updateLastSeenTimestamp = useCallback(() => {
    const timestamp = new Date().toISOString() as Timestamp;

    if (scope === ChatScope.Global) {
      dispatch(setGlobalChatLastSeenTimestamp({ value: timestamp }));
    } else if (scope === ChatScope.Private && targetId) {
      dispatch(
        setLastSeenTimestampForPrivateChat({
          participantId: targetId as ParticipantId,
          timestamp,
        })
      );
    } else if (scope === ChatScope.Group && targetId) {
      dispatch(
        setLastSeenTimestampForGroupChat({
          groupId: targetId as GroupId,
          timestamp,
        })
      );
    } else if (scope === ChatScope.Breakout && targetId) {
      dispatch(
        setLastSeenTimestampForBreakoutChat({
          timestamp,
        })
      );
    }
  }, [dispatch, scope, targetId]);

  useEffect(() => {
    if (!isRoomDeleted) {
      updateLastSeenTimestamp();
    }
  }, [isRoomDeleted, updateLastSeenTimestamp]);

  const lastProcessedCountRef = useRef(searchedMessages.length);
  useEffect(() => {
    if (searchedMessages.length > lastProcessedCountRef.current && !isRoomDeleted) {
      updateLastSeenTimestamp();
      lastProcessedCountRef.current = searchedMessages.length;
    }
  }, [searchedMessages.length, isRoomDeleted, updateLastSeenTimestamp]);

  // Scroll to bottom when search changes or new messages arrive and user is at bottom
  const scrollToBottom = useCallback(() => {
    if (virtualList.current) {
      virtualList.current.scrollToIndex({
        index: searchedMessages.length - 1,
        alignToTop: false,
        prerender: 10,
      });
    }
  }, [searchedMessages.length]);

  const { viewportRef, viewportNode } = useChatScroll({
    isLoading: isLoadingMoreChunks,
    messages: searchedMessages,
    searchValue: chatSearchValue,
    scrollToBottom,
  });
  const viewportRefObject = useMemo(() => ({ current: viewportNode }), [viewportNode]);

  useEffect(() => {
    const triggerElement = loadMoreTriggerRef.current;
    if (!nextIndex || isLoadingMoreChunks || chatSearchValue || !triggerElement) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          dispatch(setIsLoadingMoreChunks(true));
          dispatch(getHistoryChunk.action({ scope, messageIndex: nextIndex, target: targetId }));
        }
      },
      {
        root: viewportNode,
        rootMargin: '50px 0px 0px 0px',
        threshold: 0.1,
      }
    );

    observer.observe(triggerElement);

    return () => {
      observer.disconnect();
    };
  }, [nextIndex, isLoadingMoreChunks, chatSearchValue, dispatch, scope, viewportNode, targetId]);

  useLayoutEffect(() => {
    if (searchedMessages.length === 0) {
      return;
    }

    const lastMessage = searchedMessages[searchedMessages.length - 1];
    if (lastMessage && !('event' in lastMessage) && lastMessage.source === ourUuid) {
      scrollToBottom();
    }
  }, [searchedMessages, scrollToBottom, ourUuid]);

  useEffect(() => {
    if (chatSearchValue.length >= 2 && nextIndex !== null) {
      dispatch(
        searchHistory.action({
          scope,
          term: chatSearchValue,
        })
      );
    }
  }, [chatSearchValue, nextIndex, scope, dispatch]);

  if (chatSearchValue && searchedMessages.length === 0) {
    return <NoSearchResult onReset={onReset} />;
  }

  if (combinedMessageAndEvents.length > 0) {
    return (
      <ChatOrderedList ref={viewportRef} data-testid="combined-messages" empty={searchedMessages.length === 0}>
        {nextIndex !== null && (
          <Box
            ref={loadMoreTriggerRef}
            sx={{
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isLoadingMoreChunks && <CircularProgress size={24} />}
          </Box>
        )}
        <ViewportList
          ref={virtualList}
          viewportRef={viewportRefObject}
          items={searchedMessages}
          overscan={8}
          itemMargin={0}
          initialAlignToTop={false}
          scrollThreshold={100}
          initialIndex={searchedMessages.length - 1}
        >
          {(message) => (
            <ListItem key={message.id} disableGutters>
              <ChatMessage message={message} />
            </ListItem>
          )}
        </ViewportList>
      </ChatOrderedList>
    );
  }

  return (
    <Stack sx={{ flex: 1, overflow: 'hidden', justifyContent: 'center' }}>
      <Stack data-testid="no-messages" spacing={2} sx={{ alignItems: 'center', overflow: 'auto' }}>
        <Box>
          <StyledEncryptedMessagesIcon type="decorative" />
        </Box>
        <Typography align="center" variant="body2">
          {t('encrypted-messages')}
        </Typography>
      </Stack>
    </Stack>
  );
};

export default ChatList;
