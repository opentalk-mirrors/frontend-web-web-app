// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useRemoteParticipant } from '@livekit/components-react';
import { screen } from '@testing-library/react';
import { Mock } from 'vitest';

import { constructConnectionIdentifier } from '../../../utils/constructConnectionIdentifier';
import { configureStore, mockedParticipant, renderWithProviders } from '../../../utils/testUtils';
import VideoOverlay from './VideoOverlay';

vi.mock('@livekit/components-react', () => ({
  useRemoteParticipant: vi.fn(),
}));

const mockedDefaultRemoteParticipant = { ...mockedParticipant(0), signalClient: { isDisconnected: true } };
const connectionIdentifier = constructConnectionIdentifier(
  mockedDefaultRemoteParticipant.id,
  mockedDefaultRemoteParticipant.connections[0]
);

describe('VideoOverlay general', () => {
  const { store } = configureStore();

  beforeEach(() => {
    (useRemoteParticipant as Mock).mockReturnValue(mockedDefaultRemoteParticipant);
  });

  it('does not render any button if overlay is not active', () => {
    renderWithProviders(<VideoOverlay connectionIdentifier={connectionIdentifier} active={false} />, {
      store,
      provider: { snackbar: true, mui: true },
    });

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
  it('renders fullscreen button if overlay is active', () => {
    const { store } = configureStore({
      initialState: { fullscreen: { supported: true, active: false } },
    });
    renderWithProviders(<VideoOverlay connectionIdentifier={connectionIdentifier} active={true} />, {
      store,
      provider: { snackbar: true, mui: true },
    });

    const fullscreenButton = screen.getByRole('button', { name: 'indicator-fullscreen-open' });
    expect(fullscreenButton).toBeInTheDocument();
  });
  it('does not render fullscreen button if fullscreen feature is unavailable', () => {
    const { store } = configureStore({
      initialState: { fullscreen: { supported: false, active: false } },
    });
    renderWithProviders(<VideoOverlay connectionIdentifier={connectionIdentifier} active={true} />, {
      store,
      provider: { snackbar: true, mui: true },
    });

    expect(screen.queryByRole('button', { name: 'indicator-fullscreen-open' })).not.toBeInTheDocument();
  });
});

describe('VideoOverlay extend tab', () => {
  const { store } = configureStore();

  it('does not render extend new tab button if participant neither shares screen nor camera', () => {
    (useRemoteParticipant as Mock).mockReturnValue({
      ...mockedDefaultRemoteParticipant,
      isScreenShareEnabled: false,
      isCameraEnabled: false,
    });

    renderWithProviders(<VideoOverlay connectionIdentifier={connectionIdentifier} active={true} />, {
      store,
      provider: { snackbar: true, mui: true },
    });

    const extendNewTabButton = screen.queryByRole('button', { name: 'global-open-new-tab' });
    expect(extendNewTabButton).not.toBeInTheDocument();
  });
  it('renders extend new tab button if participant shares screen', () => {
    (useRemoteParticipant as Mock).mockReturnValue({
      ...mockedDefaultRemoteParticipant,
      isScreenShareEnabled: true,
      isCameraEnabled: false,
    });

    renderWithProviders(<VideoOverlay connectionIdentifier={connectionIdentifier} active={true} />, {
      store,
      provider: { snackbar: true, mui: true },
    });

    const extendNewTabButton = screen.getByRole('button', { name: 'global-open-new-tab' });
    expect(extendNewTabButton).toBeInTheDocument();
  });
  it('renders extend new tab button if participant enabled camera', () => {
    (useRemoteParticipant as Mock).mockReturnValue({
      ...mockedDefaultRemoteParticipant,
      isScreenShareEnabled: false,
      isCameraEnabled: true,
    });

    renderWithProviders(<VideoOverlay connectionIdentifier={connectionIdentifier} active={true} />, {
      store,
      provider: { snackbar: true, mui: true },
    });

    const extendNewTabButton = screen.getByRole('button', { name: 'global-open-new-tab' });
    expect(extendNewTabButton).toBeInTheDocument();
  });
  it('renders extend new tab button if participant shares screen AND enabled camera', () => {
    (useRemoteParticipant as Mock).mockReturnValue({
      ...mockedDefaultRemoteParticipant,
      isScreenShareEnabled: true,
      isCameraEnabled: true,
    });

    renderWithProviders(<VideoOverlay connectionIdentifier={connectionIdentifier} active={true} />, {
      store,
      provider: { snackbar: true, mui: true },
    });

    const extendNewTabButton = screen.getByRole('button', { name: 'global-open-new-tab' });
    expect(extendNewTabButton).toBeInTheDocument();
  });
});
