// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, screen } from '@testing-library/react';

import { configureStore, renderWithProviders } from '../../utils/testUtils';
import BetaBadge from './BetaBadge';

describe('BetaBadge', () => {
  it('renders without crashing', () => {
    const { store } = configureStore();
    expect(() => renderWithProviders(<BetaBadge />, { store })).not.toThrow();
  });

  it('displays the beta badge text', () => {
    const { store } = configureStore();
    renderWithProviders(<BetaBadge />, { store });
    const badge = screen.getByText('global-beta');
    expect(badge).toBeInTheDocument();
  });

  it('should open the popover on hover', () => {
    const { store } = configureStore();
    renderWithProviders(<BetaBadge />, { store });
    const badge = screen.getByText('global-beta');
    fireEvent.mouseOver(badge);
    const popoverContent = screen.getByText('beta-flag-tooltip-text');
    expect(popoverContent).toBeInTheDocument();
  });
});
