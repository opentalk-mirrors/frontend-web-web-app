// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useRemoteParticipant } from '@livekit/components-react';
import { screen } from '@testing-library/react';

import { renderWithProviders, mockedParticipant, configureStore } from '../../../utils/testUtils';
import VideoOverlay from './VideoOverlay';

jest.mock('@livekit/components-react', () => ({
  useRemoteParticipant: jest.fn(),
}));

const mockedDefaultRemoteParticipant = { ...mockedParticipant(0), signalClient: { isDisconnected: true } };

describe('VideoOverlay general', () => {
  const { store } = configureStore();

  beforeEach(() => {
    (useRemoteParticipant as jest.Mock).mockReturnValue(mockedDefaultRemoteParticipant);
  });

  test('does not render any button if overlay is not active', () => {
    renderWithProviders(<VideoOverlay participantId={mockedDefaultRemoteParticipant.id} active={false} />, {
      store,
      provider: { snackbar: true },
    });

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
  test('renders fullscreen button if overlay is active', async () => {
    renderWithProviders(<VideoOverlay participantId={mockedDefaultRemoteParticipant.id} active={true} />, {
      store,
      provider: { snackbar: true },
    });

    const fullscreenButton = screen.getByRole('button', { name: 'indicator-fullscreen-open' });
    expect(fullscreenButton).toBeInTheDocument();
  });
});

describe('VideoOverlay extend tab', () => {
  const { store } = configureStore();

  test('does not render extend new tab button if participant neither shares screen nor camera', () => {
    (useRemoteParticipant as jest.Mock).mockReturnValue({
      ...mockedDefaultRemoteParticipant,
      isScreenShareEnabled: false,
      isCameraEnabled: false,
    });

    renderWithProviders(<VideoOverlay participantId={mockedDefaultRemoteParticipant.id} active={true} />, {
      store,
      provider: { snackbar: true },
    });

    const extendNewTabButton = screen.queryByRole('button', { name: 'indicator-extend-new-tab' });
    expect(extendNewTabButton).not.toBeInTheDocument();
  });
  test('renders extend new tab button if participant shares screen', () => {
    (useRemoteParticipant as jest.Mock).mockReturnValue({
      ...mockedDefaultRemoteParticipant,
      isScreenShareEnabled: true,
      isCameraEnabled: false,
    });

    renderWithProviders(<VideoOverlay participantId={mockedDefaultRemoteParticipant.id} active={true} />, {
      store,
      provider: { snackbar: true },
    });

    const extendNewTabButton = screen.getByRole('button', { name: 'indicator-extend-new-tab' });
    expect(extendNewTabButton).toBeInTheDocument();
  });
  test('renders extend new tab button if participant enabled camera', () => {
    (useRemoteParticipant as jest.Mock).mockReturnValue({
      ...mockedDefaultRemoteParticipant,
      isScreenShareEnabled: false,
      isCameraEnabled: true,
    });

    renderWithProviders(<VideoOverlay participantId={mockedDefaultRemoteParticipant.id} active={true} />, {
      store,
      provider: { snackbar: true },
    });

    const extendNewTabButton = screen.getByRole('button', { name: 'indicator-extend-new-tab' });
    expect(extendNewTabButton).toBeInTheDocument();
  });
  test('renders extend new tab button if participant shares screen AND enabled camera', () => {
    (useRemoteParticipant as jest.Mock).mockReturnValue({
      ...mockedDefaultRemoteParticipant,
      isScreenShareEnabled: true,
      isCameraEnabled: true,
    });

    renderWithProviders(<VideoOverlay participantId={mockedDefaultRemoteParticipant.id} active={true} />, {
      store,
      provider: { snackbar: true },
    });

    const extendNewTabButton = screen.getByRole('button', { name: 'indicator-extend-new-tab' });
    expect(extendNewTabButton).toBeInTheDocument();
  });
});
