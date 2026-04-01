// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, screen } from '@testing-library/react';

import { configureStore, renderWithProviders } from '../../utils/testUtils';
import { CoffeeBreakView } from './CoffeeBreakView';

describe('CoffeeBreakView', () => {
  it('displays active layer title', async () => {
    const { store } = configureStore({
      initialState: {
        timer: {
          style: 'coffee-break',
          startedAt: new Date().toISOString(),
        },
      },
    });
    renderWithProviders(<CoffeeBreakView />, { store, provider: { mui: true } });
    const titleElement = await screen.findByText('coffee-break-layer-title');
    expect(titleElement).toBeInTheDocument();
  });

  it('changes curtain state on button click', async () => {
    const { store } = configureStore({
      initialState: {
        timer: {
          style: 'coffee-break',
          startedAt: new Date().toISOString(),
        },
        ui: {
          showCoffeeBreakCurtain: true,
        },
      },
    });

    renderWithProviders(<CoffeeBreakView />, { store, provider: { mui: true } });
    const button = await screen.findByRole('button', { name: 'coffee-break-layer-button' });
    fireEvent.click(button);
    expect(store.getState().ui.showCoffeeBreakCurtain).toBe(false);
  });
});
