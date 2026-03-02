// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useCallback, useLayoutEffect, useRef, useState } from 'react';

import { RoomEvent } from '../store/slices/eventSlice';
import { ChatMessage } from '../types';

interface ChatScrollProps {
  isLoading: boolean;
  messages: Array<ChatMessage | RoomEvent>;
  searchValue: string;
  scrollToBottom: () => void;
}

const AT_BOTTOM_THRESHOLD = 3;

export function useChatScroll({ isLoading, messages, searchValue, scrollToBottom }: ChatScrollProps) {
  const [viewportNode, setViewportNode] = useState<HTMLUListElement | null>(null);
  const viewportNodeRef = useRef<HTMLUListElement | null>(null);
  const viewportRef = useCallback((node: HTMLUListElement | null) => {
    viewportNodeRef.current = node;
    setViewportNode(node);
  }, []);

  const isAtBottom = useRef(true);
  const prevScrollHeight = useRef(0);
  const prevLoading = useRef(isLoading);
  const requestAnimationFrameId = useRef<number | null>(null);

  // Simplified scroll handler that only tracks if user is at bottom
  const handleChatScroll = useCallback(() => {
    if (requestAnimationFrameId.current !== null || !viewportNode) {
      return;
    }

    requestAnimationFrameId.current = requestAnimationFrame(() => {
      const { scrollHeight, clientHeight, scrollTop } = viewportNode;
      isAtBottom.current = scrollHeight - clientHeight - scrollTop <= AT_BOTTOM_THRESHOLD;

      requestAnimationFrameId.current = null;
    });
  }, [viewportNode]);

  useLayoutEffect(() => {
    if (!viewportNode) {
      return;
    }
    viewportNode.addEventListener('scroll', handleChatScroll, { passive: true });
    return () => {
      viewportNode.removeEventListener('scroll', handleChatScroll);
      if (requestAnimationFrameId.current !== null) {
        cancelAnimationFrame(requestAnimationFrameId.current);
      }
    };
  }, [viewportNode, handleChatScroll]);

  useLayoutEffect(() => {
    if (!viewportNode) {
      return;
    }

    if (prevLoading.current && !isLoading && viewportNodeRef.current) {
      // Maintain position after loading
      viewportNodeRef.current.scrollTop = viewportNodeRef.current.scrollHeight - prevScrollHeight.current;
    } else if (isAtBottom.current || searchValue) {
      scrollToBottom();
    }

    prevLoading.current = isLoading;
    prevScrollHeight.current = viewportNode.scrollHeight;
  }, [isLoading, searchValue, messages.length, scrollToBottom, viewportNode]);

  return { viewportRef, viewportNode, handleChatScroll };
}
