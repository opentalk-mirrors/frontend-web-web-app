// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { PropsWithChildren } from 'react';

import { render, screen, cleanup, mockStore, mockedParticipant } from '../../../utils/testUtils';
import SpeakerWindow from './SpeakerWindow';

jest.mock('@livekit/components-react', () => ({
  useParticipantContext: () => mockedParticipant(0),
  useRoomContext: () => jest.fn(),
  useRemoteParticipants: () => [mockedParticipant(0)],
  useSortedParticipants: () => [mockedParticipant(0), mockedParticipant(1)],
  ParticipantContext: {
    Provider: ({ children }: PropsWithChildren) => {
      return <div data-testid="participantContext">{children}</div>;
    },
  },
}));

jest.mock('../../ParticipantWindow', () => ({
  __esModule: true,
  default: () => <div data-testid="participantWindow"></div>,
}));

afterEach(() => {
  cleanup();
});

describe('SpeakerWindow', () => {
  test('SpeakerWindow is not rendered with zero participants', async () => {
    const { store } = mockStore(0);
    await render(<SpeakerWindow />, store);

    expect(screen.queryByTestId('ParticipantWindow')).not.toBeInTheDocument();
  });

  test('SpeakerWindow is rendered with one participant', async () => {
    const { store } = mockStore(1);
    await render(<SpeakerWindow />, store);

    expect(screen.getByTestId('participantWindow')).toBeInTheDocument();
  });
});
