// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { act, renderHook, waitFor } from '@testing-library/react';

import { startBroadcastRoom } from '../../../store/slices/livekitSlice';
import { useBroadcastChannel } from './useBroadcastChannel';

const mockDispatch = vi.fn();

vi.mock('../../../hooks', () => ({
  useAppDispatch: () => mockDispatch,
}));

type MessageEventLike = { data: { namespace: string; payload: unknown } };

type MockChannel = {
  postMessage: ReturnType<typeof vi.fn>;
  onmessage: ((event: MessageEventLike) => void) | null;
  triggerMessage: (event: MessageEventLike) => void;
};

const createMockChannel = (): MockChannel => {
  let handler: MockChannel['onmessage'] = null;

  return {
    postMessage: vi.fn(),
    get onmessage() {
      return handler;
    },
    set onmessage(fn) {
      handler = fn;
    },
    triggerMessage(event) {
      handler?.(event);
    },
  };
};

const originalBroadcastChannel = globalThis.BroadcastChannel;
let mockChannels: MockChannel[] = [];

const broadcastChannelMock = vi.fn(function BroadcastChannelMock(_channelId: string) {
  const channel = createMockChannel();
  mockChannels.push(channel);
  return channel as unknown as BroadcastChannel;
});

beforeAll(() => {
  // Vitest JSDOM environment does not provide BroadcastChannel, so we stub it here.
  globalThis.BroadcastChannel = broadcastChannelMock as unknown as typeof BroadcastChannel;
});

afterAll(() => {
  globalThis.BroadcastChannel = originalBroadcastChannel;
});

beforeEach(() => {
  vi.clearAllMocks();
  mockChannels = [];
});

it('does nothing when channelId is undefined', () => {
  const { result } = renderHook(() => useBroadcastChannel(undefined));

  expect(broadcastChannelMock).not.toHaveBeenCalled();
  expect(mockDispatch).not.toHaveBeenCalled();
  expect(result.current).toEqual({
    accessToken: undefined,
    mediaType: undefined,
    participantId: undefined,
    livekitUrl: undefined,
    roomId: undefined,
  });
});

it('requests livekit data when a channelId is provided', async () => {
  renderHook(() => useBroadcastChannel('channel-id'));

  await waitFor(() => expect(broadcastChannelMock).toHaveBeenCalledWith('channel-id'));
  await waitFor(() => expect(mockChannels[0]).toBeDefined());
  expect(mockChannels[0].postMessage).toHaveBeenCalledWith({
    namespace: 'extended_tab',
    payload: { action: 'request_livekit_data' },
  });
  expect(mockDispatch).toHaveBeenCalledWith(
    startBroadcastRoom({ accessToken: undefined, connectionIdentifier: undefined })
  );
});

it('stores received livekit data and dispatches the start action with credentials', async () => {
  const { result } = renderHook(() => useBroadcastChannel('channel-id'));

  const connectionIdentifier = 'participant-1';
  const payload = {
    action: 'livekit_data',
    accessToken: 'token-123',
    connectionIdentifier,
    mediaType: 'video' as const,
    livekitUrl: 'wss://livekit.example',
    roomId: 'room-123',
  };

  await waitFor(() => expect(mockChannels[0]).toBeDefined());

  act(() => {
    mockChannels[0].triggerMessage({ data: { namespace: 'extended_tab', payload } });
  });

  await waitFor(() => expect(result.current.accessToken).toBe('token-123'));
  expect(result.current).toEqual({
    accessToken: 'token-123',
    mediaType: 'video',
    connectionIdentifier,
    livekitUrl: 'wss://livekit.example',
    roomId: 'room-123',
  });
  expect(mockDispatch).toHaveBeenCalledTimes(2);
  expect(mockDispatch).toHaveBeenLastCalledWith(startBroadcastRoom({ accessToken: 'token-123', connectionIdentifier }));
});
