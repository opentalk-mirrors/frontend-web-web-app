// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, List, ListItem, Stack, Typography, styled } from '@mui/material';
import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ViewportList, ViewportListRef } from 'react-viewport-list';

import EncryptedMessagesImage from '../../../assets/images/encrypted-messages-illustration.svg?react';
import { useAppSelector } from '../../../hooks';
import { selectCombinedMessageAndEvents } from '../../../store/selectors';
import type { RoomEvent } from '../../../store/slices/eventSlice';
import { selectChatSearchValue } from '../../../store/slices/uiSlice';
import { ChatMessage as ChatMessageType, ChatScope, ParticipantId, TargetId } from '../../../types';
import ChatMessage from './ChatMessage';
import NoSearchResult from './NoSearchResult';

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

const ChatList = ({ scope = ChatScope.Global, targetId, onReset }: ChatListProps) => {
  // Everytime selectCombinedMessageAndEvents is called new array is returned regardless of changes.
  const combinedMessageAndEvents = useAppSelector(selectCombinedMessageAndEvents(scope, targetId));
  const { t } = useTranslation();
  const chatSearchValue = useAppSelector(selectChatSearchValue);
  const viewportReference = useRef<HTMLUListElement | null>(null);
  const isAtTheBottom = useRef<boolean>(true);
  const virtualList = useRef<ViewportListRef | null>(null);

  const searchedMessages = useMemo(() => {
    if (!chatSearchValue) {
      return combinedMessageAndEvents;
    }

    // TODO: we need a common interface for messages and events in order not to use 'any'.
    return combinedMessageAndEvents.reduce((output, record: ChatMessageType | RoomEvent) => {
      if (Object.prototype.hasOwnProperty.call(record, 'event')) return output;
      // TODO: naive approach that fails for languages such as turkish, spanish, french
      // as we cannot search for words such as "mañana" with "manana" or "Günaydın" with "gunaydin".
      // this should be extended if we start introducing new languages. One potential solution
      // would be to use `locale-index-of` npm package.
      if ((record as ChatMessageType).content.toLowerCase().indexOf(chatSearchValue.toLowerCase()) > -1) {
        output.push(record as ChatMessageType);
      }

      return output;
    }, [] as ChatMessageType[]);
  }, [combinedMessageAndEvents.length /** We don't modify messages so we can rely on the length. */, chatSearchValue]);

  const handleChatScrolling = useCallback((event: Event) => {
    /**
     * Since scroll events can fire at a high rate,
     * the event handler shouldn't execute computationally expensive
     * operations such as DOM modifications.
     * Instead, it is recommended to throttle the event using
     * requestAnimationFrame(), setTimeout(), or a CustomEvent, as follows.
     */
    requestAnimationFrame(() => {
      /**
       * 2 pixels tolerance works for all tested use cases, when OS is configured to
       * scale up resolution, scrollTop provides float number instead of the integers.
       */
      const BOTTOM_TOLERANCE_IN_PIXELS = 2;
      const chatList = event.target as HTMLUListElement;
      const computedChatListStyle = window.getComputedStyle(chatList, '');
      const borderTopWidth = parseFloat(computedChatListStyle.getPropertyValue('border-top-width'));
      const borderBottomWidth = parseFloat(computedChatListStyle.getPropertyValue('border-bottom-width'));
      isAtTheBottom.current =
        Math.abs(
          chatList.scrollHeight - chatList.clientHeight - chatList.scrollTop - borderTopWidth - borderBottomWidth
        ) < BOTTOM_TOLERANCE_IN_PIXELS;
    });
  }, []);

  const scrollToBottom = useCallback(() => {
    if (virtualList.current) {
      virtualList.current.scrollToIndex({
        index: searchedMessages.length - 1,
        alignToTop: false,
        prerender: 10,
      });
    }
  }, [searchedMessages.length]);

  useLayoutEffect(() => {
    scrollToBottom();
  }, [chatSearchValue]);

  useLayoutEffect(() => {
    if (isAtTheBottom.current) {
      scrollToBottom();
    }
  }, [combinedMessageAndEvents.length, scrollToBottom]);

  useLayoutEffect(() => {
    if (viewportReference.current) {
      viewportReference.current.addEventListener('scroll', handleChatScrolling);

      return () => {
        viewportReference.current?.removeEventListener('scroll', handleChatScrolling);
      };
    }
  }, [combinedMessageAndEvents.length, chatSearchValue]);

  if (chatSearchValue && searchedMessages.length === 0) {
    return <NoSearchResult onReset={onReset} />;
  }

  if (combinedMessageAndEvents.length > 0) {
    return (
      <ChatOrderedList ref={viewportReference} data-testid="combined-messages" empty={searchedMessages.length === 0}>
        <ViewportList
          ref={virtualList}
          viewportRef={viewportReference}
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
    <Stack flex={1} overflow="hidden" justifyContent="center">
      <Stack data-testid="no-messages" alignItems="center" overflow="auto" spacing={2}>
        <Box>
          <EncryptedMessagesImage width="7em" height="7em" />
        </Box>
        <Typography align="center" variant="body2">
          {t('encrypted-messages')}
        </Typography>
      </Stack>
    </Stack>
  );
};

export default ChatList;
