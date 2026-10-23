// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import { Track } from 'livekit-client';

import SpeakerView from '.';
import { ConnectionIdentifier } from '../../types';
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
});
