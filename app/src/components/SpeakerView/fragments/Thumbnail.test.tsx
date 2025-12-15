// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import { PropsWithChildren } from 'react';

import { constructConnectionIdentifier } from '../../../utils/constructConnectionIdentifier';
import { renderWithProviders, mockStore, mockedParticipant } from '../../../utils/testUtils';
import Thumbnail from './Thumbnail';

vi.mock('@livekit/components-react', () => ({
  ParticipantContext: {
    Provider: ({ children }: PropsWithChildren) => {
      return <div data-testid="buttomContainer"> {children}</div>;
    },
  },
  useRoomContext: () => vi.fn(),
  useParticipantContext: () => mockedParticipant(0),
}));

vi.mock('../../ParticipantWindow', () => ({
  __esModule: true,
  default: () => <div data-testid="participantWindow"></div>,
}));

describe('Thumbnail', () => {
  it('ThumbnailContainer rendered width one participant', () => {
    const { store } = mockStore(1);

    const participant = Object.values(store.getState().participants.entities)[0];
    const connectionIdentifier = constructConnectionIdentifier(participant.id, participant.connections[0]);

    renderWithProviders(<Thumbnail width={0} />, { store, provider: { mui: true } });

    // Initial ThumbnailContainer appears
    expect(screen.getByTestId(`thumbsVideo-${connectionIdentifier}`)).toBeInTheDocument();
  });
});
