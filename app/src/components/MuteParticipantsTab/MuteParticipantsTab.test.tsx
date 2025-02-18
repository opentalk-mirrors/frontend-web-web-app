// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { mockStore, renderWithProviders, mockedParticipant } from '../../utils/testUtils';
import MuteParticipantsTab from './MuteParticipantsTab';

const NUMBER_OF_PARTICIPANTS = 4;
const UNMUTED_PARTICIPANTS = 2;

jest.mock('@livekit/components-react', () => ({
  useRemoteParticipants: () => [mockedParticipant(0), mockedParticipant(1), mockedParticipant(2), mockedParticipant(3)],
  usePersistentUserChoices: () => jest.fn(),
  useRoomContext: () => jest.fn(),
}));

jest.mock('../../commonComponents/SearchAndSelectParticipantsTab', () => ({
  ...jest.requireActual('../../commonComponents/SearchAndSelectParticipantsTab'),
  __esModule: true,
  SearchAndSelectParticipantsTab: () => <div data-testid="searchAndSelectParticipantsTab"></div>,
  default: () => <div data-testid="searchAndSelectParticipantsTab"></div>,
}));

describe('MuteParticipantsTab', () => {
  const { store } = mockStore(NUMBER_OF_PARTICIPANTS, {
    video: true,
    screen: true,
    audio: UNMUTED_PARTICIPANTS,
  });

  test(`component will render SearchAndSelectParticipantsTab`, () => {
    renderWithProviders(<MuteParticipantsTab />, { store });

    expect(screen.getByTestId('searchAndSelectParticipantsTab')).toBeInTheDocument();
  });
});
