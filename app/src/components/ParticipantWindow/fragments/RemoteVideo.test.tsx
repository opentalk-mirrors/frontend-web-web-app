// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { idFromDescriptor } from '../../../modules/WebRTC';
import { mockedVideoMediaDescriptor, mockStore, renderWithProviders } from '../../../utils/testUtils';
import RemoteVideo from './RemoteVideo';

jest.mock('@livekit/components-react', () => ({
  VideoTrack: () => jest.fn(),
  useParticipantTracks: () => jest.fn(),
  useRoomContext: () => jest.fn(),
}));

describe('RemoteVideo', () => {
  const { store } = mockStore(1, { video: true });
  it('render without crashing', () => {
    renderWithProviders(<RemoteVideo descriptor={mockedVideoMediaDescriptor(0)} />, { store });

    expect(screen.getByTestId(`remoteVideo-${idFromDescriptor(mockedVideoMediaDescriptor(0))}`)).toBeInTheDocument();
  });
});
