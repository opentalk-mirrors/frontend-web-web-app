// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, within } from '@testing-library/react';

import { configureStore, mockedParticipant, renderWithProviders } from '../../utils/testUtils';
import Toolbar from './Toolbar';

vi.mock('@livekit/components-react', () => ({
  useTrackToggle: () => ({ source: 'microphone' }),
  useRoomContext: () => vi.fn(),
  useLocalParticipant: () => ({ localParticipant: mockedParticipant(0) }),
  useLocalParticipantPermissions: () => vi.fn(),
}));

vi.mock('@livekit/components-core', () => ({
  sortParticipants: () => vi.fn(),
}));

vi.mock('livekit-client', () => ({
  Track: {
    Source: {
      Camera: 'camera',
      Microphone: 'microphone',
    },
  },
  VideoCaptureOptions: () => vi.fn(),
  setLogExtension: () => vi.fn(),
}));

vi.mock('./fragments/EndCallButton', () => ({
  __esModule: true,
  default: () => <div data-testid="end-call-button"></div>,
}));

vi.mock('./fragments/MoreButton', () => ({
  __esModule: true,
  default: () => <div data-testid="more-button"></div>,
}));

vi.mock('./fragments/VideoButton', () => ({
  __esModule: true,
  default: () => <div data-testid="video-button"></div>,
}));

vi.mock('./fragments/AudioButton', () => ({
  __esModule: true,
  default: () => <div data-testid="audio-button"></div>,
}));

vi.mock('./fragments/ShareScreenButton', () => ({
  __esModule: true,
  default: () => <div data-testid="share-screen-button"></div>,
}));

vi.mock('./fragments/HandraiseButton', () => ({
  __esModule: true,
  default: () => <div data-testid="hand-raise-button"></div>,
}));

describe('Toolbar', () => {
  it('renders buttons', () => {
    const { store } = configureStore();
    renderWithProviders(<Toolbar />, { store, provider: { mui: true } });

    const container = screen.getByLabelText('landmark-complementary-toolbar');
    expect(container).toBeInTheDocument();

    expect(within(container).getByTestId('hand-raise-button')).toBeInTheDocument();
    expect(within(container).getByTestId('share-screen-button')).toBeInTheDocument();
    expect(within(container).getByTestId('audio-button')).toBeInTheDocument();
    expect(within(container).getByTestId('video-button')).toBeInTheDocument();
    expect(within(container).getByTestId('more-button')).toBeInTheDocument();
    expect(within(container).getByTestId('end-call-button')).toBeInTheDocument();
  });
});
