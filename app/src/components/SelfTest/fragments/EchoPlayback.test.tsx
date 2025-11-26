// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { act, render, screen, waitFor } from '@testing-library/react';
import type { LocalAudioTrack } from 'livekit-client';

import type { EchoTestState } from '../../../modules/WebRTC/EchoTest';
import EchoPlayBack from './EchoPlayback';

const { mockWarning, mockAddEventListener, mockRemoveEventListener, mockConnect, mockClose } = vi.hoisted(() => ({
  mockWarning: vi.fn(),
  mockAddEventListener: vi.fn(),
  mockRemoveEventListener: vi.fn(),
  mockConnect: vi.fn(),
  mockClose: vi.fn(),
}));

let mockOutStream: MediaStream;

vi.mock('../../../commonComponents', async (importOriginal) => ({
  ...(await importOriginal()),
  notifications: {
    warning: mockWarning,
  },
}));

vi.mock('../../../modules/WebRTC/EchoTest', () => {
  class MockEchoTest {
    addEventListener = mockAddEventListener;
    removeEventListener = mockRemoveEventListener;
    connect = mockConnect;
    close = mockClose;

    get outStream() {
      return mockOutStream;
    }
  }

  return { EchoTest: MockEchoTest };
});

const createLocalAudioTrack = (echoCancellation = true): LocalAudioTrack =>
  ({
    mediaStreamTrack: {
      getSettings: () => ({ echoCancellation }),
    },
    mediaStream: { id: 'media-stream' } as unknown as MediaStream,
  }) as unknown as LocalAudioTrack;

describe('EchoPlayBack', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOutStream = { id: 'out-stream' } as unknown as MediaStream;
    mockAddEventListener.mockImplementation((_event, handler) => handler);
  });

  it('warns when echo cancellation is disabled and connects to echo test', async () => {
    const track = createLocalAudioTrack(false);

    render(<EchoPlayBack localAudioTrack={track} />);

    await waitFor(() =>
      expect(mockWarning).toHaveBeenCalledWith('echotest-warn-no-echo-cancellation', { persist: true })
    );
    expect(mockConnect).toHaveBeenCalledWith(track.mediaStream);
    expect(mockAddEventListener).toHaveBeenCalledWith('stateChanged', expect.any(Function));
  });

  it('skips initialization when no media stream track is present', () => {
    render(<EchoPlayBack localAudioTrack={{} as LocalAudioTrack} />);

    expect(mockWarning).not.toHaveBeenCalled();
    expect(mockAddEventListener).not.toHaveBeenCalled();
    expect(mockConnect).not.toHaveBeenCalled();
  });

  it('attaches the echo out stream when a stream update event arrives', async () => {
    const track = createLocalAudioTrack();
    render(<EchoPlayBack localAudioTrack={track} />);

    await waitFor(() => expect(mockAddEventListener).toHaveBeenCalledTimes(1));
    const [, handler] = mockAddEventListener.mock.calls[0] as [string, (state: EchoTestState) => void];
    const audioElement = screen.getByTestId('echo-playback-audio') as HTMLMediaElement & { srcObject: unknown };
    Object.defineProperty(audioElement, 'srcObject', { value: null, writable: true });

    await act(async () => handler('streamUpdate'));

    expect(audioElement.srcObject).toBe(mockOutStream);
  });

  it('clears the audio source when the echo test closes', async () => {
    const track = createLocalAudioTrack();
    render(<EchoPlayBack localAudioTrack={track} />);

    await waitFor(() => expect(mockAddEventListener).toHaveBeenCalledTimes(1));
    const [, handler] = mockAddEventListener.mock.calls[0] as [string, (state: EchoTestState) => void];
    const audioElement = screen.getByTestId('echo-playback-audio') as HTMLMediaElement & { srcObject: unknown };
    Object.defineProperty(audioElement, 'srcObject', { value: mockOutStream, writable: true });

    await act(async () => {
      handler('streamUpdate');
      handler('closed');
    });

    expect(audioElement.srcObject).toBeNull();
  });

  it('closes the echo test and removes the listener on unmount', async () => {
    const track = createLocalAudioTrack();
    const { unmount } = render(<EchoPlayBack localAudioTrack={track} />);

    await waitFor(() => expect(mockAddEventListener).toHaveBeenCalledTimes(1));
    const [, handler] = mockAddEventListener.mock.calls[0] as [string, (state: EchoTestState) => void];

    unmount();

    expect(mockClose).toHaveBeenCalledTimes(1);
    expect(mockRemoveEventListener).toHaveBeenCalledWith('stateChanged', handler);
  });
});
