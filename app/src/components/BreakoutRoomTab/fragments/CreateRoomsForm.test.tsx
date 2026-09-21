// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { mockStore, mockedParticipant, renderWithProviders } from '../../../utils/testUtils';
import CreateRoomsForm from './CreateRoomsForm';

const NUMBER_OF_PARTICIPANTS = 4;
const UNASSIGNED_WARNING = 'breakout-room-unassigned-participants-warning';

const renderForm = () => {
  const { store } = mockStore(NUMBER_OF_PARTICIPANTS);
  renderWithProviders(<CreateRoomsForm />, { store, provider: { mui: true } });
};

const getStartButton = () => screen.getByRole('button', { name: 'breakout-room-start-button' });

const assignParticipantsToFirstRoom = async (
  user: ReturnType<typeof userEvent.setup>,
  participantIndexes: Array<number>
) => {
  await user.click(screen.getAllByRole('button', { name: 'global-edit' })[0]);
  for (const index of participantIndexes) {
    await user.click(screen.getByRole('checkbox', { name: mockedParticipant(index).displayName }));
  }
  await user.click(screen.getByRole('button', { name: 'user-selection-button-save' }));
};

describe('CreateRoomsForm', () => {
  it('hides the warning and enables the start button once every participant is assigned', async () => {
    const user = userEvent.setup();
    renderForm();

    await assignParticipantsToFirstRoom(user, [0, 1, 2, 3]);

    expect(screen.queryByText(UNASSIGNED_WARNING)).not.toBeInTheDocument();
    expect(getStartButton()).toBeEnabled();
  });

  it('keeps the warning and the disabled start button when only some participants are assigned', async () => {
    const user = userEvent.setup();
    renderForm();

    await assignParticipantsToFirstRoom(user, [0]);

    expect(screen.getByText(UNASSIGNED_WARNING)).toBeInTheDocument();
    expect(getStartButton()).toBeDisabled();
  });

  it('does not require manual assignments when random distribution is enabled', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole('switch', { name: 'breakout-room-form-field-random-distribution' }));

    expect(screen.queryByText(UNASSIGNED_WARNING)).not.toBeInTheDocument();
    expect(getStartButton()).toBeEnabled();
  });
});
