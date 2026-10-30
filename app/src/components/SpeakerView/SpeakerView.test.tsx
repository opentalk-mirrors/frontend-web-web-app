// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import { Track } from 'livekit-client';

import SpeakerView from '.';
import type { CinemaViewParticipant } from '../../hooks/useCinemaViewParticipants';
import { ConnectionId, ConnectionIdentifier, ParticipantId } from '../../types';
import { renderWithProviders, mockStore } from '../../utils/testUtils';

const { mockUseCinemaViewParticipants, mockSpeakerWindow, mockFilmstrip } = vi.hoisted(() => ({
  mockUseCinemaViewParticipants: vi.fn(),
  mockSpeakerWindow: vi.fn(),
  mockFilmstrip: vi.fn(),
}));

vi.mock('../../hooks', async (importOriginal) => ({
  ...((await importOriginal()) as typeof import('../../hooks')),
  useCinemaViewParticipants: () => mockUseCinemaViewParticipants(),
}));

vi.mock('./fragments/SpeakerWindow', () => ({
  __esModule: true,
  default: (props: unknown) => {
    mockSpeakerWindow(props);
    return <div />;
  },
}));

vi.mock('./fragments/Filmstrip', () => ({
  __esModule: true,
  default: (props: unknown) => {
    mockFilmstrip(props);
    return <div />;
  },
}));

const cinemaViewData = {
  cinemaViewParticipants: [],
  remoteParticipantsMap: new Map(),
  featuredTile: {
    connectionIdentifier: 'participant-0:connection-0' as ConnectionIdentifier,
    source: Track.Source.ScreenShare,
  },
};

const createParticipant = (index: number, connections = [`connection-${index}` as ConnectionId]) =>
  ({
    id: `participant-${index}` as ParticipantId,
    connections,
    displayName: `Participant ${index}`,
  }) as CinemaViewParticipant;

describe('SpeakerView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCinemaViewParticipants.mockReturnValue(cinemaViewData);
  });

  it('renders SpeakerView correctly', () => {
    const { store } = mockStore(0);
    renderWithProviders(<SpeakerView />, { store });

    // Initial elements appear
    expect(screen.getByTestId('SpeakerView-Container')).toBeInTheDocument();
  });

  it('passes the same participant data to the speaker window and the filmstrip', () => {
    const { store } = mockStore(0);
    renderWithProviders(<SpeakerView />, { store });

    expect(mockUseCinemaViewParticipants).toHaveBeenCalled();
    expect(mockSpeakerWindow).toHaveBeenLastCalledWith(expect.objectContaining(cinemaViewData));
    expect(mockFilmstrip).toHaveBeenLastCalledWith(expect.objectContaining(cinemaViewData));
  });

  describe('while LiveKit has not determined a featured tile yet', () => {
    it('features the camera of the first participant known to the controller', () => {
      const participants = [createParticipant(1), createParticipant(2)];
      mockUseCinemaViewParticipants.mockReturnValue({
        cinemaViewParticipants: participants,
        remoteParticipantsMap: new Map(),
        featuredTile: undefined,
      });
      const { store } = mockStore(0);
      renderWithProviders(<SpeakerView />, { store });

      const expectedTile = {
        connectionIdentifier: 'participant-1:connection-1' as ConnectionIdentifier,
        source: Track.Source.Camera,
      };
      expect(mockSpeakerWindow).toHaveBeenLastCalledWith(
        expect.objectContaining({ cinemaViewParticipants: participants, featuredTile: expectedTile })
      );
      expect(mockFilmstrip).toHaveBeenLastCalledWith(
        expect.objectContaining({ cinemaViewParticipants: participants, featuredTile: expectedTile })
      );
    });

    it('skips participants without a connection', () => {
      mockUseCinemaViewParticipants.mockReturnValue({
        cinemaViewParticipants: [createParticipant(1, []), createParticipant(2)],
        remoteParticipantsMap: new Map(),
        featuredTile: undefined,
      });
      const { store } = mockStore(0);
      renderWithProviders(<SpeakerView />, { store });

      expect(mockSpeakerWindow).toHaveBeenLastCalledWith(
        expect.objectContaining({
          featuredTile: {
            connectionIdentifier: 'participant-2:connection-2' as ConnectionIdentifier,
            source: Track.Source.Camera,
          },
        })
      );
    });
  });

  it('prefers the featured tile from LiveKit over the controller fallback', () => {
    mockUseCinemaViewParticipants.mockReturnValue({
      ...cinemaViewData,
      cinemaViewParticipants: [createParticipant(1)],
    });
    const { store } = mockStore(0);
    renderWithProviders(<SpeakerView />, { store });

    expect(mockSpeakerWindow).toHaveBeenLastCalledWith(
      expect.objectContaining({ featuredTile: cinemaViewData.featuredTile })
    );
    expect(mockFilmstrip).toHaveBeenLastCalledWith(
      expect.objectContaining({ featuredTile: cinemaViewData.featuredTile })
    );
  });
});
