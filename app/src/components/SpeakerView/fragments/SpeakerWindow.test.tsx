// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import { PropsWithChildren } from 'react';

import { renderWithProviders, mockStore, mockedParticipant } from '../../../utils/testUtils';
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

describe('SpeakerWindow', () => {
  it('SpeakerWindow is not rendered with zero participants', () => {
    const { store } = mockStore(0);
    renderWithProviders(<SpeakerWindow />, { store, provider: { mui: true } });

    expect(screen.queryByTestId('ParticipantWindow')).not.toBeInTheDocument();
  });

  it('SpeakerWindow is rendered with one participant', () => {
    const { store } = mockStore(1);
    renderWithProviders(<SpeakerWindow />, { store, provider: { mui: true } });

    expect(screen.getByTestId('participantWindow')).toBeInTheDocument();
  });
});
