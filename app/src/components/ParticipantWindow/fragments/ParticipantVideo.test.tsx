// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { act, fireEvent, screen, within, waitFor } from '@testing-library/react';
import { Track } from 'livekit-client';
import React from 'react';
import { Mock } from 'vitest';

import useConferenceUiVersion from '../../../hooks/useConferenceUiVersion';
import { idFromDescriptor, MediaDescriptor } from '../../../modules/WebRTC';
import { initialState as livekitInitialState } from '../../../store/slices/livekitSlice';
import {
  presenterOverlayPinnedParticipantIdSet,
  presenterVideoPositions,
  setPresenterVideoPosition,
} from '../../../store/slices/uiSlice';
import { MediaSessionType, VideoSetting } from '../../../types';
import { constructConnectionIdentifier } from '../../../utils/constructConnectionIdentifier';
import { mockStore, mockedParticipant, renderWithProviders } from '../../../utils/testUtils';
import ParticipantVideo from './ParticipantVideo';

type ScreenPresenterVideoMockProps = {
  participantId: string;
  isVideoPinned: boolean;
  togglePin: () => void;
  changeVideoPosition: () => void;
  videoPosition: (typeof presenterVideoPositions)[number];
  isThumbnail?: boolean;
};

const useRemoteParticipantMock = vi.hoisted(() => vi.fn());
const remoteVideoMock = vi.hoisted(() =>
  vi.fn(({ descriptor }: { descriptor: MediaDescriptor }) => (
    <div data-testid={`remoteVideo-${idFromDescriptor(descriptor)}`}></div>
  ))
);
const lastScreenPresenterVideoProps = vi.hoisted(() => ({
  current: undefined as ScreenPresenterVideoMockProps | undefined,
}));
const screenPresenterVideoMock = vi.hoisted(() =>
  vi.fn((props: ScreenPresenterVideoMockProps) => {
    lastScreenPresenterVideoProps.current = props;
    return <div data-testid="screenPresenterVideo"></div>;
  })
);

vi.mock('../../../hooks/useConferenceUiVersion', () => ({
  __esModule: true,
  default: vi.fn(),
}));

vi.mock('@livekit/components-react', () => ({
  useRemoteParticipant: useRemoteParticipantMock,
  useRoomContext: () => vi.fn(),
}));

vi.mock('@mui/material', async () => {
  const actual = await vi.importActual<typeof import('@mui/material')>('@mui/material');

  return {
    ...actual,
    Slide: ({ in: inProp, children }: { in?: boolean; children: React.ReactNode }) => (inProp ? <>{children}</> : null),
  };
});

vi.mock('../../ParticipantVideoFallback', () => ({
  __esModule: true,
  default: () => <div data-testid="participant-video-fallback" />,
}));

vi.mock('./RemoteVideo', () => ({
  __esModule: true,
  default: remoteVideoMock,
}));

vi.mock('./ScreenPresenterVideo', () => ({
  __esModule: true,
  default: screenPresenterVideoMock,
}));

const participant = mockedParticipant(0);
const connectionIdentifier = constructConnectionIdentifier(participant.id, participant.connections[0]);

const baseProps = {
  connectionIdentifier,
  presenterVideoIsActive: false,
  source: Track.Source.Camera as MediaSessionType,
};

const serializableParticipantsState = {
  ids: [connectionIdentifier],
  entities: {
    [connectionIdentifier]: {
      ...participant,
      getTrackPublication: undefined,
      setMicrophoneEnabled: undefined,
      videoTrackPublications: {},
    },
  },
};

describe('ParticipantVideo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useConferenceUiVersion as Mock).mockReturnValue({ isV2: false });
    lastScreenPresenterVideoProps.current = undefined;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows video fallback when no streams are available', () => {
    const { store } = mockStore(1, {
      store: { initialState: { participants: serializableParticipantsState } },
    });
    useRemoteParticipantMock.mockReturnValue({
      ...participant,
      isScreenShareEnabled: false,
      isCameraEnabled: false,
    });

    renderWithProviders(<ParticipantVideo {...baseProps} />, { store, provider: { mui: true } });

    expect(screen.getByTestId('participant-video-fallback')).toBeInTheDocument();
    expect(screen.queryByTestId(/remoteVideo/)).not.toBeInTheDocument();
  });

  it('shows and hides the presenter tile when screen sharing based on mouse movement', async () => {
    vi.useFakeTimers();
    const { store } = mockStore(1, {
      store: { initialState: { participants: serializableParticipantsState } },
    });
    useRemoteParticipantMock.mockReturnValue({
      ...participant,
      isCameraEnabled: true,
      isScreenShareEnabled: true,
    });

    renderWithProviders(<ParticipantVideo {...baseProps} />, { store, provider: { mui: true } });

    const screenShareContainer = screen.getByTestId('participantScreenShareVideo');
    expect(screenShareContainer).toBeInTheDocument();
    expect(
      screen.getByTestId(
        `remoteVideo-${idFromDescriptor({ connectionIdentifier, mediaType: Track.Source.ScreenShare } as MediaDescriptor)}`
      )
    ).toBeInTheDocument();
    expect(screen.queryByTestId('screenPresenterVideo')).not.toBeInTheDocument();

    fireEvent.mouseMove(screenShareContainer);

    expect(screen.getByTestId('screenPresenterVideo')).toBeInTheDocument();

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.queryByTestId('screenPresenterVideo')).not.toBeInTheDocument();
  });

  it('dispatches presenter controls when toggling pin or position', () => {
    const { store, dispatchSpy } = mockStore(1, {
      store: { initialState: { participants: serializableParticipantsState } },
    });
    useRemoteParticipantMock.mockReturnValue({
      ...participant,
      isCameraEnabled: true,
      isScreenShareEnabled: true,
    });

    renderWithProviders(<ParticipantVideo {...baseProps} presenterVideoIsActive />, { store, provider: { mui: true } });

    expect(screen.getByTestId('screenPresenterVideo')).toBeInTheDocument();
    const lastPresenterVideoProps = lastScreenPresenterVideoProps.current;
    expect(lastPresenterVideoProps?.isVideoPinned).toBe(false);

    act(() => {
      lastPresenterVideoProps?.togglePin();
    });
    expect(dispatchSpy).toHaveBeenCalledWith(presenterOverlayPinnedParticipantIdSet(connectionIdentifier));

    act(() => {
      lastPresenterVideoProps?.changeVideoPosition();
    });
    expect(dispatchSpy).toHaveBeenCalledWith(setPresenterVideoPosition(presenterVideoPositions[0]));
  });

  it('unsubscribes camera tracks when the quality cap disables videos', async () => {
    const cameraPublication = { isSubscribed: true, source: Track.Source.Camera, setSubscribed: vi.fn() };
    const screenPublication = { isSubscribed: true, source: Track.Source.ScreenShare, setSubscribed: vi.fn() };
    const { store } = mockStore(1, {
      store: { initialState: { livekit: { ...livekitInitialState, qualityCap: VideoSetting.Off } } },
    });

    useRemoteParticipantMock.mockReturnValue({
      ...participant,
      isCameraEnabled: true,
      isScreenShareEnabled: false,
      videoTrackPublications: new Map([
        ['camera', cameraPublication],
        ['screen', screenPublication],
      ]),
    });

    renderWithProviders(<ParticipantVideo {...baseProps} />, { store, provider: { mui: true } });

    await waitFor(() => expect(cameraPublication.setSubscribed).toHaveBeenCalledWith(false));
    expect(screenPublication.setSubscribed).not.toHaveBeenCalled();
    expect(screen.getByTestId('participant-video-fallback')).toBeInTheDocument();
  });
});

describe('media rendering logic in ui V1', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useConferenceUiVersion as Mock).mockReturnValue({ isV2: false });
    lastScreenPresenterVideoProps.current = undefined;
  });
  it('renders the camera feed when the participant only shares video', () => {
    const { store } = mockStore(1, {
      store: { initialState: { participants: serializableParticipantsState } },
    });
    useRemoteParticipantMock.mockReturnValue({
      ...participant,
      isCameraEnabled: true,
      isScreenShareEnabled: false,
    });

    renderWithProviders(<ParticipantVideo {...baseProps} />, { store, provider: { mui: true } });

    expect(
      screen.getByTestId(
        `remoteVideo-${idFromDescriptor({ connectionIdentifier, mediaType: Track.Source.Camera } as MediaDescriptor)}`
      )
    ).toBeInTheDocument();
    expect(screen.queryByTestId('participantScreenShareVideo')).not.toBeInTheDocument();
    expect(screen.queryByTestId('participant-video-fallback')).not.toBeInTheDocument();
  });
  it('renders screen share and camera feed inside, when the participant shares screen and the video is active', () => {
    const { store } = mockStore(1, {
      store: { initialState: { participants: serializableParticipantsState } },
    });
    useRemoteParticipantMock.mockReturnValue({
      ...participant,
      isCameraEnabled: true,
      isScreenShareEnabled: true,
    });

    renderWithProviders(<ParticipantVideo {...baseProps} presenterVideoIsActive />, {
      store,
      provider: { mui: true },
    });

    const screenShare = screen.getByTestId('participantScreenShareVideo');
    expect(
      within(screenShare).getByTestId(
        `remoteVideo-${idFromDescriptor({ connectionIdentifier, mediaType: Track.Source.ScreenShare } as MediaDescriptor)}`
      )
    ).toBeInTheDocument();
    expect(within(screenShare).getByTestId('screenPresenterVideo')).toBeInTheDocument();
  });
});

describe('media rendering logic in ui V2', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useConferenceUiVersion as Mock).mockReturnValue({ isV2: true });
    lastScreenPresenterVideoProps.current = undefined;
  });

  it('renders only the screen share in a screen share tile if ui V2 is selected', () => {
    const { store } = mockStore(1, {
      store: { initialState: { participants: serializableParticipantsState } },
    });
    useRemoteParticipantMock.mockReturnValue({
      ...participant,
      isCameraEnabled: true,
      isScreenShareEnabled: true,
    });

    renderWithProviders(<ParticipantVideo {...baseProps} source={Track.Source.ScreenShare} presenterVideoIsActive />, {
      store,
      provider: { mui: true },
    });

    expect(
      screen.getByTestId(
        `remoteVideo-${idFromDescriptor({ connectionIdentifier, mediaType: Track.Source.ScreenShare } as MediaDescriptor)}`
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId(
        `remoteVideo-${idFromDescriptor({ connectionIdentifier, mediaType: Track.Source.Camera } as MediaDescriptor)}`
      )
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('screenPresenterVideo')).not.toBeInTheDocument();
  });

  it('renders only the camera feed in a camera tile while sharing screen if ui V2 is selected', () => {
    const { store } = mockStore(1, {
      store: { initialState: { participants: serializableParticipantsState } },
    });
    useRemoteParticipantMock.mockReturnValue({
      ...participant,
      isCameraEnabled: true,
      isScreenShareEnabled: true,
    });

    renderWithProviders(<ParticipantVideo {...baseProps} source={Track.Source.Camera} />, {
      store,
      provider: { mui: true },
    });

    expect(
      screen.getByTestId(
        `remoteVideo-${idFromDescriptor({ connectionIdentifier, mediaType: Track.Source.Camera } as MediaDescriptor)}`
      )
    ).toBeInTheDocument();
    expect(screen.queryByTestId('participantScreenShareVideo')).not.toBeInTheDocument();
  });
});
