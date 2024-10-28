// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { cleanup } from '@testing-library/react';

import { idFromDescriptor } from '../../../modules/WebRTC';
import { VideoSetting } from '../../../types';
import { render, screen, mockedVideoMediaDescriptor, mockStore, mockedParticipant } from '../../../utils/testUtils';
import ParticipantVideo from './ParticipantVideo';

jest.mock('@livekit/components-react', () => ({
  useParticipantContext: () => mockedParticipant(0),
  useRoomContext: () => jest.fn(),
}));

jest.mock('./RemoteVideo', () => ({
  __esModule: true,
  default: () => <div data-testid="remoteVideo"></div>,
}));
jest.mock('./ScreenPresenterVideo', () => ({
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
  afterEach(() => cleanup());

  //TODO rewrite the tests
  test('render participantVideo component', async () => {
    await render(<ParticipantVideo {...ParticipantWindowProps} />, store);

    expect(screen.getByTestId('avatarContainer')).toBeInTheDocument();
  });

  test('render participantVideo component with video stream only', async () => {
    const { store } = mockStore(1, { video: true, screen: false });
    const participant = mockedParticipant(0);
    await render(<ParticipantVideo {...ParticipantWindowProps} participantId={participant.id} />, store);

    expect(screen.queryByTestId('participantSreenShareVideo')).not.toBeInTheDocument();
  });

  test('render participantVideo component without any stream should only display avatar component', async () => {
    const { store } = mockStore(1, { video: false, screen: false });
    const participant = mockedParticipant(0);
    await render(<ParticipantVideo {...ParticipantWindowProps} participantId={participant.id} />, store);

    expect(screen.getByTestId('avatarContainer')).toBeInTheDocument();
    expect(screen.queryByTestId('participantSreenShareVideo')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`remoteVideo-${idFromDescriptor(mockedVideoMediaDescriptor(0))}`)
    ).not.toBeInTheDocument();
  });
});
