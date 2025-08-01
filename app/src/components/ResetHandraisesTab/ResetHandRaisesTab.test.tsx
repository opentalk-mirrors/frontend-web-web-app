// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { mockStore, renderWithProviders, mockedParticipant } from '../../utils/testUtils';
import ResetHandraisesTab from './ResetHandraisesTab';

vi.mock('@livekit/components-react', () => ({
  useRemoteParticipants: () => [mockedParticipant(0), mockedParticipant(1), mockedParticipant(2)],
  useRoomContext: () => vi.fn(),
}));

vi.mock('../../commonComponents/SearchAndSelectParticipantsTab', () => ({
  SearchAndSelectParticipantsTab: () => <div data-testid="searchAndSelectParticipantsTab"></div>,
}));

describe('Reset Hand Raises Tab', () => {
  it('renders ResetRaisedHands component properly', () => {
    const { store } = mockStore(0);
    renderWithProviders(<ResetHandraisesTab />, { store });

    expect(screen.getByTestId('searchAndSelectParticipantsTab')).toBeInTheDocument();
  });
});
