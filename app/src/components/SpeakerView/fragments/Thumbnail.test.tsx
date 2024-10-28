// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { PropsWithChildren } from 'react';

import { ParticipantId } from '../../../types';
import { render, screen, cleanup, mockStore, mockedParticipant } from '../../../utils/testUtils';
import Thumbnail from './Thumbnail';

jest.mock('@livekit/components-react', () => ({
  ParticipantContext: {
    Provider: ({ children }: PropsWithChildren) => {
      return <div data-testid="buttomContainer"> {children}</div>;
    },
  },
  useRoomContext: () => jest.fn(),
  useParticipantContext: () => mockedParticipant(0),
}));

jest.mock('../../ParticipantWindow', () => ({
  __esModule: true,
  default: () => <div data-testid="participantWindow"></div>,
}));

afterEach(() => {
  cleanup();
});

describe('Thumbnail', () => {
  test('ThumbnailContainer rendered width one participant', async () => {
    const { store } = mockStore(1);

    const ids = store.getState().participants.ids;
    const participantId = ids[0] as ParticipantId;

    await render(<Thumbnail width={0} />, store);

    // Initial ThumbnailContainer appears
    expect(screen.getByTestId(`thumbsVideo-${participantId}`)).toBeInTheDocument();
  });
});
