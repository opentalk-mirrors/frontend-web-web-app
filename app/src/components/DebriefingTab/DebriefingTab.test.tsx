// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, screen } from '@testing-library/react';

import { KickScope } from '../../types';
import { configureStore, renderWithProviders } from '../../utils/testUtils';
import DebriefingTab from './DebriefingTab';

vi.mock('../../api/types/outgoing/moderation', async (importOriginal) => ({
  ...(await importOriginal()),
  debrief: {
    action: ({ kickScope }: { kickScope: KickScope }) => ({
      type: 'debrief',
      kickScope,
    }),
  },
}));

describe('DebriefingTab', () => {
  it('calls debrief all action on button click', () => {
    const { store, dispatchSpy } = configureStore();
    renderWithProviders(<DebriefingTab />, { store });

    const button = screen.getByRole('button', { name: 'debriefing-button-all' });
    fireEvent.click(button);

    expect(dispatchSpy).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ kickScope: KickScope.All }));
  });

  it('calls debrief moderators action on button click', () => {
    const { store, dispatchSpy } = configureStore();
    renderWithProviders(<DebriefingTab />, { store });

    const button = screen.getByRole('button', { name: 'debriefing-button-moderators' });
    fireEvent.click(button);

    expect(dispatchSpy).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ kickScope: KickScope.UsersAndGuests })
    );
  });

  it('calls debrief guests action on button click', () => {
    const { store, dispatchSpy } = configureStore();
    renderWithProviders(<DebriefingTab />, { store });

    const button = screen.getByRole('button', { name: 'debriefing-button-moderators-and-users' });
    fireEvent.click(button);

    expect(dispatchSpy).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ kickScope: KickScope.Guests }));
  });
});
