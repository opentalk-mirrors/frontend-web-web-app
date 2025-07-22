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
import { selectCombinedMessageAndEvents } from '../../../store/selectors';
import {
  selectChatSearchResults,
  selectIsLoadingMoreChunks,
  selectNextIndex,
  setGlobalChatLastSeenTimestamp,
  setIsLoadingMoreChunks,
  setLastSeenTimestampForGroupChat,
  setLastSeenTimestampForPrivateChat,
} from '../../../store/slices/chatSlice';
import type { RoomEvent } from '../../../store/slices/eventSlice';
import { selectIsRoomDeleted } from '../../../store/slices/roomSlice';
import { selectChatSearchValue } from '../../../store/slices/uiSlice';
import { ChatMessage as ChatMessageType, ChatScope, GroupId, ParticipantId, TargetId, Timestamp } from '../../../types';
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
  display: empty ? 'none' : 'block',
  willChange: 'transform', // Performance has been tested with and without this property and observed significant smoothness when used.
}));

type ChatListProps = {
  scope: ChatScope;
  targetId?: TargetId;
  participant?: ParticipantId;
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

const ChatList = ({ scope = ChatScope.Global, targetId, onReset }: ChatListProps) => {
  const { t } = useTranslation();
  const combinedMessageAndEvents = useAppSelector((state) => selectCombinedMessageAndEvents(state, scope, targetId));
  const nextIndex = useAppSelector((state) => selectNextIndex(state, scope, targetId));
  const isLoadingMoreChunks = useAppSelector(selectIsLoadingMoreChunks);
  const chatSearchResults = useAppSelector(selectChatSearchResults);
  const chatSearchValue = useAppSelector(selectChatSearchValue);
  const isRoomDeleted = useAppSelector(selectIsRoomDeleted);
  const dispatch = useAppDispatch();
  const virtualList = useRef<ViewportListRef | null>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);

  const searchedMessages = useMemo(
    () => filterMessages(combinedMessageAndEvents, chatSearchValue, chatSearchResults),
    [combinedMessageAndEvents, chatSearchValue, chatSearchResults]
  );

  useEffect(() => {
    if (!isRoomDeleted) {
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
      }
    }
  }, [dispatch, targetId, scope, searchedMessages]);

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
          dispatch(getHistoryChunk.action({ scope, messageIndex: nextIndex }));
        }
      },
      {
        root: viewportRef.current,
        rootMargin: '50px 0px 0px 0px',
        threshold: 0.1,
      }
    );

    observer.observe(triggerElement);

    return () => {
      observer.disconnect();
    };
  }, [nextIndex, isLoadingMoreChunks, chatSearchValue, dispatch, scope]);

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

  const { viewportRef, handleChatScroll } = useChatScroll({
    isLoading: isLoadingMoreChunks,
    messages: searchedMessages,
    searchValue: chatSearchValue,
    scrollToBottom,
  });

  useLayoutEffect(() => {
    scrollToBottom();
  }, [chatSearchValue]);

  useLayoutEffect(() => {
    const viewPortNode = viewportRef.current;
    if (!viewPortNode) {
      return;
    }
    viewPortNode.addEventListener('scroll', handleChatScroll);
    return () => {
      viewPortNode.removeEventListener('scroll', handleChatScroll);
    };
  }, [handleChatScroll]);

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
          viewportRef={viewportRef}
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
