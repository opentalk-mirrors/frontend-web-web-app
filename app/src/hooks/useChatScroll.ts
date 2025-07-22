// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useCallback, useLayoutEffect, useRef } from 'react';

import { RoomEvent } from '../store/slices/eventSlice';
import { ChatMessage } from '../types';

interface ChatScrollProps {
  isLoading: boolean;
  messages: Array<ChatMessage | RoomEvent>;
  searchValue: string;
  scrollToBottom: () => void;
}

export function useChatScroll({ isLoading, messages, searchValue, scrollToBottom }: ChatScrollProps) {
  const viewportRef = useRef<HTMLUListElement | null>(null);
  const isAtBottom = useRef(true);
  const prevScrollHeight = useRef(0);
  const prevLoading = useRef(isLoading);

  // Simplified scroll handler that only tracks if user is at bottom
  const handleChatScroll = useCallback(() => {
    requestAnimationFrame(() => {
      const node = viewportRef.current;
      if (!node) {
        return;
      }

      const { scrollHeight, clientHeight, scrollTop } = node;
      isAtBottom.current = scrollHeight - clientHeight - scrollTop <= 3;
    });
  }, []);

  useLayoutEffect(() => {
    if (!viewportRef.current) {
      return;
    }

    if (prevLoading.current && !isLoading) {
      // Maintain position after loading
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight - prevScrollHeight.current;
    } else if (isAtBottom.current || searchValue) {
      scrollToBottom();
    }

    prevLoading.current = isLoading;
    prevScrollHeight.current = viewportRef.current?.scrollHeight || 0;
  }, [isLoading, searchValue, messages.length, scrollToBottom]);

  return { viewportRef, handleChatScroll };
}
