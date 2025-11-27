// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen, act } from '@testing-library/react';
import { RemoteParticipant, RemoteTrackPublication, Room } from 'livekit-client';

import { mockedVideoMediaDescriptor } from '../../../utils/testUtils';
import Video from './Video';

const WAIT_FOR_LIVEKIT_ROOM_UPDATE = 2000;

const mockVideoTrack = vi.fn(({ className }: { className?: string }) => (
  <div data-testid="video-track" className={className} />
));

vi.mock('@livekit/components-react', () => ({
  VideoTrack: (props: unknown) => mockVideoTrack(props as { className?: string }),
}));

describe('Video', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockVideoTrack.mockClear();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('shows a loader while waiting for livekit to provide the track', () => {
    const room = { remoteParticipants: new Map() } as unknown as Room;

    render(<Video mediaDescriptor={mockedVideoMediaDescriptor(0)} room={room} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByTestId('video-track')).not.toBeInTheDocument();
  });

  it('renders the video track after it becomes available', () => {
    const mediaDescriptor = mockedVideoMediaDescriptor(0);
    const publication = {} as RemoteTrackPublication;
    const participant = {
      getTrackPublication: vi.fn().mockReturnValue(publication),
    } as unknown as RemoteParticipant;
    const room = {
      remoteParticipants: new Map([[mediaDescriptor.participantId, participant]]),
    } as unknown as Room;

    render(<Video mediaDescriptor={mediaDescriptor} room={room} />);

    act(() => {
      vi.advanceTimersByTime(WAIT_FOR_LIVEKIT_ROOM_UPDATE);
    });

    expect(screen.getByTestId('video-track')).toBeInTheDocument();

    const lastCallProps = mockVideoTrack.mock.calls.at(-1)?.[0] as { trackRef?: unknown };
    expect(lastCallProps?.trackRef).toMatchObject({
      participant,
      publication,
      source: mediaDescriptor.mediaType,
    });
  });

  it('updates the rendered height when the window is resized', () => {
    const mediaDescriptor = mockedVideoMediaDescriptor(1);
    const publication = {} as RemoteTrackPublication;
    const participant = {
      getTrackPublication: vi.fn().mockReturnValue(publication),
    } as unknown as RemoteParticipant;
    const room = {
      remoteParticipants: new Map([[mediaDescriptor.participantId, participant]]),
    } as unknown as Room;

    render(<Video mediaDescriptor={mediaDescriptor} room={room} />);

    act(() => {
      vi.advanceTimersByTime(WAIT_FOR_LIVEKIT_ROOM_UPDATE);
    });
    const videoElement = screen.getByTestId('video-track');

    const newHeight = 1234;
    (window as { innerHeight: number }).innerHeight = newHeight;

    act(() => {
      window.dispatchEvent(new Event('resize'));
      vi.runAllTimers();
    });

    expect(videoElement).toHaveStyle(`height: ${newHeight}px`);
  });
});
