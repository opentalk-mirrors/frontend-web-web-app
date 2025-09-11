// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import { PropsWithChildren } from 'react';

import { configureStore, renderWithProviders } from '../utils/testUtils';
import LobbyTemplate from './LobbyTemplate';

vi.mock('./fragments/BrowserCompatibilityInfo', () => ({
  __esModule: true,
  default: ({ children }: PropsWithChildren) => {
    return <>{children}</>;
  },
}));

const { store } = configureStore({ initialState: {} });

describe('LobbyTemplate', () => {
  it('licenses are not displayed by default', () => {
    renderWithProviders(<LobbyTemplate />, { store });

    expect(screen.queryByTestId('LegalContainer')).toBeNull();
  });

  it('licenses are displayed on demand', () => {
    renderWithProviders(<LobbyTemplate legal />, { store });

    expect(screen.getByTestId('LegalContainer')).toBeInTheDocument();
  });

  it('template renders children', () => {
    renderWithProviders(
      <LobbyTemplate>
        <div data-testid="test-child" />
      </LobbyTemplate>,
      { store }
    );
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });
});
