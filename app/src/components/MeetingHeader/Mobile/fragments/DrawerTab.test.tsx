// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { renderWithProviders } from '../../../../utils/testUtils';
import DrawerTab from './DrawerTab';

const props = {
  tabTitle: 'Test Tab',
  disabled: false,
  active: false,
  handleClick: vi.fn(),
  showIndicator: false,
};

describe('DrawerTab rendering logic', () => {
  it('renders without crashing', () => {
    expect(() =>
      renderWithProviders(<DrawerTab {...props}>{null}</DrawerTab>, { provider: { mui: true } })
    ).not.toThrow();
  });

  it('renders children when active', () => {
    const { rerender } = renderWithProviders(
      <DrawerTab {...props}>
        <div>Active Content</div>
      </DrawerTab>,
      { provider: { mui: true } }
    );
    expect(screen.queryByText('Active Content')).not.toBeInTheDocument();
    rerender(
      <DrawerTab {...props} active={true}>
        <div>Active Content</div>
      </DrawerTab>
    );
    expect(screen.getByText('Active Content')).toBeInTheDocument();
  });

  it('renders title without children when disabled', () => {
    const { unmount } = renderWithProviders(
      <DrawerTab {...props} active={true}>
        <div>Active Content</div>
      </DrawerTab>,
      { provider: { mui: true } }
    );
    expect(screen.getByText('Active Content')).toBeInTheDocument();
    unmount();
    renderWithProviders(
      <DrawerTab {...props} active={true} disabled={true}>
        <div>Active Content</div>
      </DrawerTab>,
      { provider: { mui: true } }
    );
    expect(screen.queryByText('Active Content')).not.toBeInTheDocument();
    expect(screen.getByText('Test Tab')).toBeInTheDocument();
  });
});
