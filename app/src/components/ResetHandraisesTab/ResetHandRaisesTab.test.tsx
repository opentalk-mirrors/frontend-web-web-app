// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { mockStore, renderWithProviders, mockedParticipant } from '../../utils/testUtils';
import ResetHandraisesTab from './ResetHandraisesTab';

jest.mock('@livekit/components-react', () => ({
  useRemoteParticipants: () => [mockedParticipant(0), mockedParticipant(1), mockedParticipant(2)],
  useRoomContext: () => jest.fn(),
}));

jest.mock('../../commonComponents/SearchAndSelectParticipantsTab', () => ({
  SearchAndSelectParticipantsTab: () => <div data-testid="searchAndSelectParticipantsTab"></div>,
}));

describe('Reset all raised hands', () => {
  const { store } = mockStore(0);

  test('ResetRaisedHands component will render properly', () => {
    renderWithProviders(<ResetHandraisesTab />, { store });

    expect(screen.getByTestId('searchAndSelectParticipantsTab')).toBeInTheDocument();
  });
});
