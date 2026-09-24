// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useLocalParticipant } from '@livekit/components-react';
import { screen } from '@testing-library/react';
import { Track } from 'livekit-client';
import { Mock } from 'vitest';

import { changeMedia } from '../../../store/commonActions';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import { ParticipantVideoFallbackProps } from '../../ParticipantVideoFallback';
import SelfVideoContent from './SelfVideoContent';

vi.mock('@livekit/components-react', () => ({
  useLocalParticipant: vi.fn(),
  VideoTrack: () => (
    <video data-testid="video-track">
      <track kind="captions" />
    </video>
  ),
}));

vi.mock('../../ParticipantVideoFallback', () => ({
  __esModule: true,
  default: (props: ParticipantVideoFallbackProps) => (
    <div data-testid="participant-video-fallback">{props.displayName}</div>
  ),
}));

const DISPLAY_NAME = 'Test Name';

const cameraTrackWithStream = {
  source: Track.Source.Camera,
  videoTrack: { mediaStreamTrack: {} },
};

const cameraTrackWithoutStream = {
  source: Track.Source.Camera,
};

describe('SelfVideoContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useLocalParticipant as Mock).mockReturnValue({
      isCameraEnabled: true,
      cameraTrack: cameraTrackWithStream,
    });
  });

  it('renders only video stream, if camera is enabled and video stream is present', () => {
    const { store } = configureStore();
    renderWithProviders(<SelfVideoContent displayName={DISPLAY_NAME} />, { store, provider: { mui: true } });
    expect(screen.getByTestId('video-track')).toBeInTheDocument();
    expect(screen.queryByTestId('participant-video-fallback')).not.toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('renders only video fallback, if camera is disabled and video track is present', () => {
    const { store } = configureStore();
    (useLocalParticipant as Mock).mockReturnValue({
      isCameraEnabled: false,
      cameraTrack: cameraTrackWithStream,
    });
    renderWithProviders(<SelfVideoContent displayName={DISPLAY_NAME} />, { store, provider: { mui: true } });
    expect(screen.queryByTestId('video-track')).not.toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.getByTestId('participant-video-fallback')).toBeInTheDocument();
  });

  it('renders only video fallback, if camera is enabled and video track is not present', () => {
    const { store } = configureStore();
    (useLocalParticipant as Mock).mockReturnValue({
      isCameraEnabled: true,
      cameraTrack: undefined,
    });
    renderWithProviders(<SelfVideoContent displayName={DISPLAY_NAME} />, { store, provider: { mui: true } });
    expect(screen.queryByTestId('video-track')).not.toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.getByTestId('participant-video-fallback')).toBeInTheDocument();
  });

  it('renders only video fallback, if camera is enabled and video stream is not present', () => {
    const { store } = configureStore();
    (useLocalParticipant as Mock).mockReturnValue({
      isCameraEnabled: true,
      cameraTrack: cameraTrackWithoutStream,
    });
    renderWithProviders(<SelfVideoContent displayName={DISPLAY_NAME} />, { store, provider: { mui: true } });
    expect(screen.queryByTestId('video-track')).not.toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.getByTestId('participant-video-fallback')).toBeInTheDocument();
  });

  it('renders only loading indicator, if camera is being turned on', () => {
    const { store } = configureStore();
    store.dispatch(changeMedia.pending('requestId', { kind: 'videoinput', enabled: true }));
    (useLocalParticipant as Mock).mockReturnValue({
      isCameraEnabled: false,
      cameraTrack: undefined,
    });
    renderWithProviders(<SelfVideoContent displayName={DISPLAY_NAME} />, { store, provider: { mui: true } });
    expect(screen.getByRole('progressbar', { name: 'global-video-loading' })).toBeInTheDocument();
    expect(screen.queryByTestId('video-track')).not.toBeInTheDocument();
    expect(screen.queryByTestId('participant-video-fallback')).not.toBeInTheDocument();
  });

  it('renders only video fallback, if camera is being turned off', () => {
    const { store } = configureStore();
    store.dispatch(changeMedia.pending('requestId', { kind: 'videoinput', enabled: false }));
    (useLocalParticipant as Mock).mockReturnValue({
      isCameraEnabled: false,
      cameraTrack: cameraTrackWithStream,
    });
    renderWithProviders(<SelfVideoContent displayName={DISPLAY_NAME} />, { store, provider: { mui: true } });
    expect(screen.queryByRole('progressbar', { name: 'global-video-loading' })).not.toBeInTheDocument();
    expect(screen.queryByTestId('video-track')).not.toBeInTheDocument();
    expect(screen.getByTestId('participant-video-fallback')).toBeInTheDocument();
  });

  it('passes display name to video fallback', () => {
    const { store } = configureStore();
    (useLocalParticipant as Mock).mockReturnValue({
      isCameraEnabled: false,
      cameraTrack: cameraTrackWithStream,
    });
    renderWithProviders(<SelfVideoContent displayName={DISPLAY_NAME} />, { store, provider: { mui: true } });
    expect(screen.getByText(DISPLAY_NAME)).toBeInTheDocument();
  });
});
