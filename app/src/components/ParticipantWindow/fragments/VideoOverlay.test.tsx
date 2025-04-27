// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useRemoteParticipant } from '@livekit/components-react';
import { screen } from '@testing-library/react';

import { renderWithProviders, mockedParticipant, configureStore } from '../../../utils/testUtils';
import VideoOverlay from './VideoOverlay';

const mockFullscreenContext = {
  active: true,
  node: null,
  exit: jest.fn(),
  enter: jest.fn(),
  fullscreenParticipantID: '',
  setRootElement: jest.fn(),
  rootElement: null,
  setHasActiveOverlay: jest.fn(),
  isFullScreenAvailable: jest.fn(),
};

jest.mock('../../../hooks/useFullscreenContext.ts', () => ({
  useFullscreenContext: () => mockFullscreenContext,
}));

jest.mock('@livekit/components-react', () => ({
  useRemoteParticipant: jest.fn(),
}));

const mockedDefaultRemoteParticipant = { ...mockedParticipant(0), signalClient: { isDisconnected: true } };

describe('VideoOverlay general', () => {
  const { store } = configureStore();

  beforeEach(() => {
    (useRemoteParticipant as jest.Mock).mockReturnValue(mockedDefaultRemoteParticipant);
  });

  it('does not render any button if overlay is not active', () => {
    renderWithProviders(<VideoOverlay participantId={mockedDefaultRemoteParticipant.id} active={false} />, {
      store,
      provider: { snackbar: true },
    });

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
  it('renders fullscreen button if overlay is active', () => {
    mockFullscreenContext.isFullScreenAvailable = jest.fn(() => true);
    renderWithProviders(<VideoOverlay participantId={mockedDefaultRemoteParticipant.id} active={true} />, {
      store,
      provider: { snackbar: true },
    });
    expect(mockFullscreenContext.isFullScreenAvailable).toHaveBeenCalled();

    const fullscreenButton = screen.getByRole('button', { name: 'indicator-fullscreen-open' });
    expect(fullscreenButton).toBeInTheDocument();
  });
  it('does not render fullscreen button if fullscreen feature is unavailable', () => {
    mockFullscreenContext.isFullScreenAvailable = jest.fn(() => false);

    renderWithProviders(<VideoOverlay participantId={mockedDefaultRemoteParticipant.id} active={true} />, {
      store,
      provider: { snackbar: true },
    });
    expect(mockFullscreenContext.isFullScreenAvailable).toHaveBeenCalled();

    expect(screen.queryByRole('button', { name: 'indicator-fullscreen-open' })).not.toBeInTheDocument();
  });
});

describe('VideoOverlay extend tab', () => {
  const { store } = configureStore();

  it('does not render extend new tab button if participant neither shares screen nor camera', () => {
    (useRemoteParticipant as jest.Mock).mockReturnValue({
      ...mockedDefaultRemoteParticipant,
      isScreenShareEnabled: false,
      isCameraEnabled: false,
    });

    renderWithProviders(<VideoOverlay participantId={mockedDefaultRemoteParticipant.id} active={true} />, {
      store,
      provider: { snackbar: true },
    });

    const extendNewTabButton = screen.queryByRole('button', { name: 'global-open-new-tab' });
    expect(extendNewTabButton).not.toBeInTheDocument();
  });
  it('renders extend new tab button if participant shares screen', () => {
    (useRemoteParticipant as jest.Mock).mockReturnValue({
      ...mockedDefaultRemoteParticipant,
      isScreenShareEnabled: true,
      isCameraEnabled: false,
    });

    renderWithProviders(<VideoOverlay participantId={mockedDefaultRemoteParticipant.id} active={true} />, {
      store,
      provider: { snackbar: true },
    });

    const extendNewTabButton = screen.getByRole('button', { name: 'global-open-new-tab' });
    expect(extendNewTabButton).toBeInTheDocument();
  });
  it('renders extend new tab button if participant enabled camera', () => {
    (useRemoteParticipant as jest.Mock).mockReturnValue({
      ...mockedDefaultRemoteParticipant,
      isScreenShareEnabled: false,
      isCameraEnabled: true,
    });

    renderWithProviders(<VideoOverlay participantId={mockedDefaultRemoteParticipant.id} active={true} />, {
      store,
      provider: { snackbar: true },
    });

    const extendNewTabButton = screen.getByRole('button', { name: 'global-open-new-tab' });
    expect(extendNewTabButton).toBeInTheDocument();
  });
  it('renders extend new tab button if participant shares screen AND enabled camera', () => {
    (useRemoteParticipant as jest.Mock).mockReturnValue({
      ...mockedDefaultRemoteParticipant,
      isScreenShareEnabled: true,
      isCameraEnabled: true,
    });

    renderWithProviders(<VideoOverlay participantId={mockedDefaultRemoteParticipant.id} active={true} />, {
      store,
      provider: { snackbar: true },
    });

    const extendNewTabButton = screen.getByRole('button', { name: 'global-open-new-tab' });
    expect(extendNewTabButton).toBeInTheDocument();
  });
});
