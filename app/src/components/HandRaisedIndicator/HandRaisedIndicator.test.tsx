// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { configureStore, renderWithProviders } from '../../utils/testUtils';
import HandRaisedIndicator from './HandRaisedIndicator';

const LABEL = 'Alice wants to say something';

describe('HandRaisedIndicator', () => {
  it('should use the given label as accessible name', () => {
    const { store } = configureStore();
    renderWithProviders(<HandRaisedIndicator label={LABEL} />, {
      store,
      provider: { mui: true },
    });
    expect(screen.getByLabelText(LABEL)).toBeInTheDocument();
  });
  it('should not be translated by the browser', () => {
    const { store } = configureStore();
    renderWithProviders(<HandRaisedIndicator label={LABEL} />, {
      store,
      provider: { mui: true },
    });
    expect(screen.getByLabelText(LABEL)).toHaveAttribute('translate', 'no');
  });
  it('should forward the className to the root element', () => {
    const { store } = configureStore();
    renderWithProviders(<HandRaisedIndicator label={LABEL} className="custom-class" />, {
      store,
      provider: { mui: true },
    });
    expect(screen.getByLabelText(LABEL)).toHaveClass('custom-class');
  });
});
