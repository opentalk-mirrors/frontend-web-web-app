// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { createSignalingApiCall } from './createSignalingApiCall';
import type { Action } from './types/signaling';

type ExampleAction = Action & {
  foo: string;
  bar: number;
};

describe('createSignalingApiCall', () => {
  it('returns payload with only action when payload is omitted', () => {
    const prepareMessage = createSignalingApiCall<Action>('control', 'join');

    const message = prepareMessage();

    expect(message).toEqual({
      namespace: 'control',
      payload: {
        action: 'join',
      },
    });
  });

  it('returns payload with action and data when payload is provided', () => {
    const prepareMessage = createSignalingApiCall<ExampleAction>('chat', 'send_message');

    const message = prepareMessage({ foo: 'hello', bar: 42 });

    expect(message).toEqual({
      namespace: 'chat',
      payload: {
        foo: 'hello',
        bar: 42,
        action: 'send_message',
      },
    });
  });

  it('exposes a typed action creator with signaling type', () => {
    const prepareMessage = createSignalingApiCall<ExampleAction>('chat', 'send_message');

    expect(prepareMessage.action.type).toBe('signaling/chat/send_message');
    expect(prepareMessage.action({ foo: 'hello', bar: 42 })).toEqual({
      type: 'signaling/chat/send_message',
      payload: {
        foo: 'hello',
        bar: 42,
      },
    });
  });
});
