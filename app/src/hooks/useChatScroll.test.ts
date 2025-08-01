// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { renderHook, act } from '@testing-library/react';

import { ChatMessage, ChatScope, ParticipantId } from '../types';
import { useChatScroll } from './useChatScroll';

describe('useChatScroll', () => {
  const scrollToBottom = vi.fn();
  const mockMessages = [
    {
      id: '1',
      timestamp: new Date().toISOString(),
      source: 'user1' as ParticipantId,
      content: 'test',
      scope: ChatScope.Global,
    } as ChatMessage,
    {
      id: '2',
      timestamp: new Date().toISOString(),
      source: 'user2' as ParticipantId,
      content: 'test1',
      scope: ChatScope.Global,
    } as ChatMessage,
  ];

  const mockElement = {
    scrollHeight: 1000,
    clientHeight: 500,
    scrollTop: 0,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  } as unknown as HTMLUListElement;

  beforeEach(() => {
    scrollToBottom.mockClear();
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 0;
    });
  });

  it('should auto-scroll when user is at the bottom', () => {
    const { result, rerender } = renderHook((props) => useChatScroll(props), {
      initialProps: { isLoading: false, messages: mockMessages, searchValue: '', scrollToBottom },
    });

    act(() => {
      result.current.viewportRef.current = mockElement;
    });

    mockElement.scrollTop = 497;
    act(() => {
      result.current.handleChatScroll();
    });

    const newMessage = {
      id: '3',
      timestamp: new Date().toISOString(),
      source: 'user1' as ParticipantId,
      content: 'new message',
      scope: ChatScope.Global,
    } as ChatMessage;

    rerender({ isLoading: false, messages: [...mockMessages, newMessage], searchValue: '', scrollToBottom });
    expect(scrollToBottom).toHaveBeenCalled();
  });

  it('should not auto-scroll when user is not at the bottom', () => {
    const { result, rerender } = renderHook((props) => useChatScroll(props), {
      initialProps: { isLoading: false, messages: mockMessages, searchValue: '', scrollToBottom },
    });

    // Set user not at bottom
    mockElement.scrollTop = 400;
    act(() => {
      result.current.handleChatScroll();
    });

    const newMessage = {
      id: '4',
      timestamp: new Date().toISOString(),
      source: 'user2' as ParticipantId,
      content: 'another message',
      scope: ChatScope.Global,
    } as ChatMessage;

    rerender({ isLoading: false, messages: [...mockMessages, newMessage], searchValue: '', scrollToBottom });
    expect(scrollToBottom).not.toHaveBeenCalled();
  });

  it('should scroll to bottom when search value changes', () => {
    const { result, rerender } = renderHook((props) => useChatScroll(props), {
      initialProps: { isLoading: false, messages: mockMessages, searchValue: '', scrollToBottom },
    });

    act(() => {
      result.current.viewportRef.current = mockElement;
    });

    // Set user not at bottom
    mockElement.scrollTop = 400;
    act(() => {
      result.current.handleChatScroll();
    });

    rerender({ isLoading: false, messages: mockMessages, searchValue: 'test', scrollToBottom });
    expect(scrollToBottom).toHaveBeenCalled();
  });
});
