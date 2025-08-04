// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useLocalParticipant, useMediaDeviceSelect, useTracks } from '@livekit/components-react';
import type { IconButtonProps, SvgIconProps } from '@mui/material';
import { fireEvent, screen } from '@testing-library/react';

import { configureStore, renderWithProviders } from '../../utils/testUtils';
import LocalVideo from './LocalVideo';

jest.mock('@livekit/components-react', () => ({
  useTracks: jest.fn().mockReturnValue([]),
  useLocalParticipant: jest.fn(),
  VideoTrack: () => (
    <video data-testid="video-track">
      <track kind="captions" />
    </video>
  ),
  useMediaDeviceSelect: jest.fn(),
}));
jest.mock('../../assets/icons', () => ({
  PinIcon: () => <svg data-testid="pin-icon" />,
  WarningIcon: (props: SvgIconProps) => <svg data-testid="warning-icon" {...props} />,
}));
jest.mock('../../commonComponents', () => ({
  NameTile: (props: { displayName: string }) => <div data-testid="name-tile">{props.displayName}</div>,
}));
jest.mock('../ParticipantWindow/fragments/OverlayIconButton', () => ({
  OverlayIconButton: (props: IconButtonProps) => (
    <button type="button" aria-label={props['aria-label']} onClick={props.onClick} data-testid="pin-btn">
      {props.children}
    </button>
  ),
}));

describe('LocalVideo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    HTMLCanvasElement.prototype.getContext = jest.fn();
    (useLocalParticipant as jest.Mock).mockReturnValue({
      isMicrophoneEnabled: false,
      isScreenShareEnabled: false,
      isCameraEnabled: true,
      microphoneTrack: undefined,
      cameraTrack: undefined,
      lastMicrophoneError: undefined,
      lastCameraError: undefined,
    });
    (useMediaDeviceSelect as jest.Mock).mockReturnValue({
      devices: [
        { deviceId: 'xxxxx', groupId: 'xxxxxx', kind: 'audioinput', label: 'audio' },
        { deviceId: 'xxxx1', groupId: 'xxxxx1', kind: 'videoinput', label: 'video' },
      ],
    });
  });

  it('renders nothing if video and screen share are disabled', () => {
    const { store } = configureStore({
      initialState: {
        media: {
          videoEnabled: false,
          audioEnabled: false,
          videoBackgroundEffects: undefined,
        },
        user: {
          displayName: 'Test User',
        },
        ui: {
          localVideoMirroringEnabled: false,
        },
        livekit: {
          unavailable: false,
        },
      },
    });

    (useTracks as jest.Mock).mockReturnValue([]);
    (useLocalParticipant as jest.Mock).mockReturnValue({
      isMicrophoneEnabled: false,
      isScreenShareEnabled: false,
      isCameraEnabled: false,
      microphoneTrack: undefined,
      cameraTrack: undefined,
      lastMicrophoneError: undefined,
      lastCameraError: undefined,
    });

    renderWithProviders(<LocalVideo />, { store, provider: { mui: true } });
    expect(screen.queryByTestId('video-track')).not.toBeInTheDocument();
    expect(screen.queryByTestId('name-tile')).not.toBeInTheDocument();
  });

  it('renders video and name tile if video is enabled and track is present', () => {
    const { store } = configureStore({
      initialState: {
        media: {
          videoEnabled: true,
          audioEnabled: false,
          videoBackgroundEffects: undefined,
        },
        user: {
          displayName: 'Test User',
        },
        ui: {
          localVideoMirroringEnabled: false,
        },
        livekit: {
          unavailable: false,
        },
      },
    });

    // Mock useTracks to return a local video track ref
    const videoTrackRef = {
      participant: { isLocal: true, isScreenShareEnabled: false },
      publication: { videoTrack: { mediaStreamTrack: { readyState: 'live', enabled: true } } },
    };
    (useTracks as jest.Mock).mockReturnValue([videoTrackRef]);

    renderWithProviders(<LocalVideo />, { store, provider: { mui: true } });

    expect(screen.getByTestId('video-track')).toBeInTheDocument();
    expect(screen.getByTestId('name-tile')).toHaveTextContent('Test User');
  });

  it('shows loading spinner if video is enabled but track is missing', () => {
    const { store } = configureStore({
      initialState: {
        media: {
          videoEnabled: true,
          audioEnabled: false,
          videoBackgroundEffects: undefined,
        },
        user: {
          displayName: 'Test User',
        },
        ui: {
          localVideoMirroringEnabled: false,
        },
        livekit: {
          unavailable: false,
        },
      },
    });

    // Mock useTracks to return a local video track ref
    const videoTrackRef = {
      participant: { isLocal: true, isScreenShareEnabled: false },
      publication: { videoTrack: { mediaStreamTrack: null, isMuted: false } },
    };

    (useTracks as jest.Mock).mockReturnValue([videoTrackRef]);

    renderWithProviders(<LocalVideo />, { store, provider: { mui: true } });
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows warning icon if livekit is unavailable', () => {
    const { store } = configureStore({
      initialState: {
        media: {
          videoEnabled: true,
          audioEnabled: true,
          videoBackgroundEffects: undefined,
        },
        user: {
          displayName: 'Test User',
        },
        ui: {
          localVideoMirroringEnabled: false,
        },
        livekit: {
          unavailable: true,
        },
      },
    });

    (useTracks as jest.Mock).mockReturnValue([]);

    renderWithProviders(<LocalVideo />, { store, provider: { mui: true } });

    expect(screen.getByTestId('warning-icon')).toBeInTheDocument();
  });

  it('shows "no device" text if video is missing', () => {
    const { store } = configureStore({
      initialState: {
        media: {
          videoEnabled: true,
          audioEnabled: false,
          videoBackgroundEffects: undefined,
        },
        user: {
          displayName: 'Test User',
        },
        ui: {
          localVideoMirroringEnabled: false,
        },
        livekit: {
          unavailable: false,
        },
      },
    });

    const videoTrackRef = {
      participant: { isLocal: true, isScreenShareEnabled: false },
      publication: { videoTrack: { isMuted: true, mediaStreamTrack: undefined } },
    };

    (useTracks as jest.Mock).mockReturnValue([videoTrackRef]);
    (useMediaDeviceSelect as jest.Mock).mockReturnValue({ devices: [] });

    renderWithProviders(<LocalVideo />, { store, provider: { mui: true } });
    expect(screen.getByText('localvideo-no-device')).toBeInTheDocument();
  });

  it('renders pin button in fullscreen mode and calls togglePinVideo', () => {
    const togglePinVideo = jest.fn();
    const { store } = configureStore({
      initialState: {
        media: {
          videoEnabled: true,
          audioEnabled: false,
          videoBackgroundEffects: undefined,
        },
        user: {
          displayName: 'Test User',
        },
        ui: {
          localVideoMirroringEnabled: false,
        },
        livekit: {
          unavailable: false,
        },
      },
    });

    const videoTrackRef = {
      participant: { isLocal: true, isScreenShareEnabled: false },
      publication: { videoTrack: { mediaStreamTrack: { readyState: 'live', enabled: true } } },
    };

    (useTracks as jest.Mock).mockReturnValue([videoTrackRef]);

    renderWithProviders(<LocalVideo fullscreenMode togglePinVideo={togglePinVideo} isVideoPinned={true} />, {
      store,
      provider: { mui: true },
    });
    const pinBtn = screen.getByTestId('pin-btn');
    expect(pinBtn).toBeInTheDocument();
    fireEvent.click(pinBtn);
    expect(togglePinVideo).toHaveBeenCalled();
  });
});
