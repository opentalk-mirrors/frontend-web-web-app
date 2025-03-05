// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, screen } from '@testing-library/react';

import { mockStore, mockedLivekitParticipant, renderWithProviders } from '../../../utils/testUtils';
import SelectParticipantsItem, { SelectableParticipant } from './SelectParticipantsItem';

describe('SelectParticipantsItem', () => {
  const handleCheck = jest.fn();
  const { store } = mockStore(1, { video: true, screen: true });
  const participant = { ...mockedLivekitParticipant(0), selected: false } as SelectableParticipant;

  test('SelectParticipantsItem should render properly without crashing', async () => {
    renderWithProviders(<SelectParticipantsItem participant={participant} onCheck={handleCheck} />, {
      store,
      provider: { mui: true },
    });

    expect(screen.getByTestId('participantAvatar')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: participant.name })).toBeInTheDocument();
    expect(screen.getByLabelText(participant.name as string)).toBeInTheDocument();
  });

  test('click on checkBox should trigger onCheck()', async () => {
    renderWithProviders(<SelectParticipantsItem participant={participant} onCheck={handleCheck} />, {
      store,
      provider: { mui: true },
    });

    const checkbox = screen.getByRole('checkbox', { name: participant.name });
    expect(checkbox).toBeInTheDocument();
    fireEvent.click(checkbox);

    expect(handleCheck).toHaveBeenCalledTimes(1);
  });
});

export {};
