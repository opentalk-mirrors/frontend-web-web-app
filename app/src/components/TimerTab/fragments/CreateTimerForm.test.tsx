// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { TimerStyle } from '../../../types';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import CreateTimerForm from './CreateTimerForm';

describe('CreateTimerForm', () => {
  it('uses expected label to start the timer.', () => {
    const { store } = configureStore();
    renderWithProviders(<CreateTimerForm timerStyle={TimerStyle.Normal} />, { store });
    expect(screen.getByRole('button', { name: 'timer-form-button-submit' })).toBeInTheDocument();
  });
});
