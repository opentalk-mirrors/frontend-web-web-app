// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { configureStore, renderWithProviders } from '../../utils/testUtils';
import ImprintContainer from './ImprintContainer';

describe('ImprintContainer', () => {
  it('renders imprint link when url is provided', () => {
    const { store } = configureStore({
      initialState: {
        config: {
          imprintUrl: 'https://example.com/imprint',
          dataProtectionUrl: '',
        },
      },
    });

    renderWithProviders(<ImprintContainer />, { store });

    const imprintLink = screen.getByText('imprint-label');
    expect(imprintLink).toBeInTheDocument();
    expect(imprintLink).toHaveAttribute('href', 'https://example.com/imprint');
  });

  it('renders data protection link when url is provided', () => {
    const { store } = configureStore({
      initialState: {
        config: {
          imprintUrl: '',
          dataProtectionUrl: 'https://example.com/data-protection',
        },
      },
    });

    renderWithProviders(<ImprintContainer />, { store });

    const dataProtectionLink = screen.getByText('data-protection-label');
    expect(dataProtectionLink).toBeInTheDocument();
    expect(dataProtectionLink).toHaveAttribute('href', 'https://example.com/data-protection');
  });
});
