// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { idFromDescriptor } from '../../../modules/WebRTC';
import { VideoSetting } from '../../../types';
import {
  renderWithProviders,
  mockedVideoMediaDescriptor,
  mockStore,
  mockedParticipant,
} from '../../../utils/testUtils';
import ParticipantVideo from './ParticipantVideo';

vi.mock('@livekit/components-react', () => ({
  useRemoteParticipant: () => mockedParticipant(0),
  useRoomContext: () => vi.fn(),
}));

vi.mock('./RemoteVideo', () => ({
  __esModule: true,
  default: () => <div data-testid="remoteVideo"></div>,
}));
vi.mock('./ScreenPresenterVideo', () => ({
  __esModule: true,
  default: () => <div data-testid="screenPresenterVideo"></div>,
}));

const { store } = mockStore(1, { video: true, screen: true });
const participant = mockedParticipant(0);
const participantId = participant.id;

const ParticipantWindowProps = {
  quality: VideoSetting.Low,
  fullscreenMode: false,
  participantId: participantId,
  presenterVideoIsActive: true,
};

describe('ParticipantVideo', () => {
  //TODO UNIT TESTS rewrite the tests
  it('render participantVideo component', () => {
    renderWithProviders(<ParticipantVideo {...ParticipantWindowProps} />, { store, provider: { mui: true } });

    expect(screen.getByTestId('avatarContainer')).toBeInTheDocument();
  });

  it('render participantVideo component with video stream only', () => {
    const { store } = mockStore(1, { video: true, screen: false });
    const participant = mockedParticipant(0);
    renderWithProviders(<ParticipantVideo {...ParticipantWindowProps} participantId={participant.id} />, {
      store,
      provider: { mui: true },
    });

    expect(screen.queryByTestId('participantScreenShareVideo')).not.toBeInTheDocument();
  });

  it('render participantVideo component without any stream should only display avatar component', () => {
    const { store } = mockStore(1, { video: false, screen: false });
    const participant = mockedParticipant(0);
    renderWithProviders(<ParticipantVideo {...ParticipantWindowProps} participantId={participant.id} />, {
      store,
      provider: { mui: true },
    });

    expect(screen.getByTestId('avatarContainer')).toBeInTheDocument();
    expect(screen.queryByTestId('participantScreenShareVideo')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`remoteVideo-${idFromDescriptor(mockedVideoMediaDescriptor(0))}`)
    ).not.toBeInTheDocument();
  });
});
