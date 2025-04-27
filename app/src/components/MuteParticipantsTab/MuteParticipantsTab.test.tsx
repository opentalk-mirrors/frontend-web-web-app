// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useRemoteParticipants } from '@livekit/components-react';
import { fireEvent, screen } from '@testing-library/react';

import { mockStore, renderWithProviders, mockedParticipant } from '../../utils/testUtils';
import MuteParticipantsTab from './MuteParticipantsTab';

const NUMBER_OF_PARTICIPANTS = 4;
const UNMUTED_PARTICIPANTS = 2;

jest.mock('@livekit/components-react', () => ({
  useRemoteParticipants: jest.fn(),
  usePersistentUserChoices: () => jest.fn(),
  useRoomContext: () => jest.fn(),
}));

describe('MuteParticipantsTab', () => {
  const { store, dispatchSpy } = mockStore(NUMBER_OF_PARTICIPANTS);

  beforeEach(() => {
    (useRemoteParticipants as jest.Mock).mockReturnValue(
      Array.from({ length: NUMBER_OF_PARTICIPANTS }, (_, index) => ({
        ...mockedParticipant(index),
        isMicrophoneEnabled: index < UNMUTED_PARTICIPANTS,
      }))
    );
  });

  it(`component will render only unmuted participants`, async () => {
    renderWithProviders(<MuteParticipantsTab />, { store, provider: { mui: true } });

    const muteAllButton = screen.getByRole('button', { name: /global-all/i });
    const muteSelectedButton = screen.getByRole('button', { name: /global-selected/i });

    expect(muteAllButton).toBeInTheDocument();
    expect(muteSelectedButton).toBeInTheDocument();
    expect(screen.getByLabelText('participant-search-label')).toBeInTheDocument();

    const participantsList = screen.getAllByRole('listitem');
    expect(participantsList).toHaveLength(UNMUTED_PARTICIPANTS);
  });

  it('click on muteAll button should dispatch moderator_mute action', async () => {
    renderWithProviders(<MuteParticipantsTab />, { store, provider: { mui: true } });
    const allParticipantIds = [mockedParticipant(0).identity, mockedParticipant(1).identity];

    const muteAllButton = screen.getByRole('button', { name: /global-all/i });
    expect(muteAllButton).toBeInTheDocument();

    fireEvent.click(muteAllButton);

    expect(dispatchSpy.mock.calls).toContainEqual([
      {
        payload: { participants: [...allParticipantIds] },
        type: 'signaling/livekit/force_mute',
      },
    ]);
  });

  it('click on muteSelected button should dispatch moderator_mute action only for selected participant', async () => {
    renderWithProviders(<MuteParticipantsTab />, { store, provider: { mui: true } });

    const participant1 = mockedParticipant(0);
    const participant2 = mockedParticipant(1);

    const muteSelectedButton = screen.getByRole('button', { name: /global-selected/i });
    expect(muteSelectedButton).toBeInTheDocument();

    const checkbox1 = screen.getByRole('checkbox', { name: participant1.displayName });
    const checkbox2 = screen.getByRole('checkbox', { name: participant2.displayName });

    fireEvent.click(checkbox1);
    fireEvent.click(checkbox2);

    expect(checkbox1).toBeChecked();
    expect(checkbox2).toBeChecked();

    fireEvent.click(muteSelectedButton);

    expect(dispatchSpy.mock.calls).toContainEqual([
      {
        payload: { participants: [participant1.identity, participant2.identity] },
        type: 'signaling/livekit/force_mute',
      },
    ]);
  });
});
