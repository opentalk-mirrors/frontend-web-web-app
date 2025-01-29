// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useRemoteParticipant } from '@livekit/components-react';

import { render, screen, mockedParticipant, configureStore } from '../../../utils/testUtils';
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

  it('does not render any button if overlay is not active', async () => {
    await render(<VideoOverlay participantId={mockedDefaultRemoteParticipant.id} active={false} />, store);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
  it('renders fullscreen button if overlay is active', async () => {
    await render(<VideoOverlay participantId={mockedDefaultRemoteParticipant.id} active={true} />, store);
    const fullscreenButton = screen.getByRole('button', { name: 'indicator-fullscreen-open' });
    expect(fullscreenButton).toBeInTheDocument();
  });
});

describe('VideoOverlay extend tab', () => {
  const { store } = configureStore();

  it('does not render extend new tab button if participant neither shares screen nor camera', async () => {
    (useRemoteParticipant as jest.Mock).mockReturnValue({
      ...mockedDefaultRemoteParticipant,
      isScreenShareEnabled: false,
      isCameraEnabled: false,
    });

    await render(<VideoOverlay participantId={mockedDefaultRemoteParticipant.id} active={true} />, store);

    const extendNewTabButton = screen.queryByRole('button', { name: 'indicator-extend-new-tab' });
    expect(extendNewTabButton).not.toBeInTheDocument();
  });
  it('renders extend new tab button if participant shares screen', async () => {
    (useRemoteParticipant as jest.Mock).mockReturnValue({
      ...mockedDefaultRemoteParticipant,
      isScreenShareEnabled: true,
      isCameraEnabled: false,
    });

    await render(<VideoOverlay participantId={mockedDefaultRemoteParticipant.id} active={true} />, store);

    const extendNewTabButton = screen.getByRole('button', { name: 'indicator-extend-new-tab' });
    expect(extendNewTabButton).toBeInTheDocument();
  });
  it('renders extend new tab button if participant enabled camera', async () => {
    (useRemoteParticipant as jest.Mock).mockReturnValue({
      ...mockedDefaultRemoteParticipant,
      isScreenShareEnabled: false,
      isCameraEnabled: true,
    });

    await render(<VideoOverlay participantId={mockedDefaultRemoteParticipant.id} active={true} />, store);

    const extendNewTabButton = screen.getByRole('button', { name: 'indicator-extend-new-tab' });
    expect(extendNewTabButton).toBeInTheDocument();
  });
  it('renders extend new tab button if participant shares screen AND enabled camera', async () => {
    (useRemoteParticipant as jest.Mock).mockReturnValue({
      ...mockedDefaultRemoteParticipant,
      isScreenShareEnabled: true,
      isCameraEnabled: true,
    });

    await render(<VideoOverlay participantId={mockedDefaultRemoteParticipant.id} active={true} />, store);

    const extendNewTabButton = screen.getByRole('button', { name: 'indicator-extend-new-tab' });
    expect(extendNewTabButton).toBeInTheDocument();
  });
});
