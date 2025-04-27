// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { RoomEvent } from '../store/slices/eventSlice';
import { GroupId, ParticipantId, ChatScope, ChatMessage as ChatMessageType } from '../types';
import { isEventMessage } from './typeGuardUtils';

describe('should check if message is event type', () => {
  const chatMessage: ChatMessageType = {
    id: '',
    timestamp: '',
    source: '' as ParticipantId,
    content: '',
    scope: ChatScope.Global,
    group: '' as GroupId,
    target: '' as ParticipantId,
  };

  it('should return false', () => {
    expect(isEventMessage(chatMessage)).toBeFalsy();
  });

  const eventMessage: RoomEvent = {
    id: '',
    timestamp: '',
    target: '' as ParticipantId,
    event: 'joined',
  };

  it('should return true', () => {
    expect(isEventMessage(eventMessage)).toBeTruthy();
  });
});
