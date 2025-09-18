// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { TimerStyle } from '../../../types';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import ActiveTimerOverview from './ActiveTimerOverview';

describe('ActiveTimerOverview', () => {
  it('uses expected label to end the timer.', () => {
    const { store } = configureStore();
    renderWithProviders(<ActiveTimerOverview timerStyle={TimerStyle.Normal} />, { store });
    expect(screen.getByRole('button', { name: 'timer-overview-button-stop' })).toBeInTheDocument();
  });
});
