// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { idFromDescriptor } from '../../../modules/WebRTC';
import { render, screen, mockedVideoMediaDescriptor, mockStore } from '../../../utils/testUtils';
import RemoteVideo from './RemoteVideo';

jest.mock('@livekit/components-react', () => ({
  VideoTrack: () => jest.fn(),
  useParticipantTracks: () => jest.fn(),
  useRoomContext: () => jest.fn(),
}));

describe('RemoteVideo', () => {
  const { store } = mockStore(1, { video: true });
  test('render without crashing', async () => {
    await render(<RemoteVideo descriptor={mockedVideoMediaDescriptor(0)} />, store);
    expect(screen.getByTestId(`remoteVideo-${idFromDescriptor(mockedVideoMediaDescriptor(0))}`)).toBeInTheDocument();
  });
});
