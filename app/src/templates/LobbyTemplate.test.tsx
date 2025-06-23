// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen } from '@testing-library/react';
import { PropsWithChildren } from 'react';

import LobbyTemplate from './LobbyTemplate';

jest.mock('./fragments/BrowserCompatibilityInfo', () => ({
  __esModule: true,
  default: ({ children }: PropsWithChildren) => {
    return <>{children}</>;
  },
}));

describe('LobbyTemplate', () => {
  it('licenses are not displayed by default', () => {
    render(<LobbyTemplate />);

    expect(screen.queryByTestId('LegalContainer')).toBeNull();
  });

  it('licenses are displayed on demand', () => {
    render(<LobbyTemplate legal />);

    expect(screen.getByTestId('LegalContainer')).toBeInTheDocument();
  });

  it('template renders children', () => {
    render(
      <LobbyTemplate>
        <div data-testid="test-child" />
      </LobbyTemplate>
    );
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });
});
