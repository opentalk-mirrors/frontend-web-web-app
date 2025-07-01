// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen } from '@testing-library/react';

import DrawerTab from './DrawerTab';

const props = {
  tabTitle: 'Test Tab',
  disabled: false,
  active: false,
  handleClick: jest.fn(),
  showIndicator: false,
};

describe('DrawerTab rendering logic', () => {
  it('renders without crashing', () => {
    expect(() => render(<DrawerTab {...props}>{null}</DrawerTab>)).not.toThrow();
  });

  it('renders children when active', () => {
    const { rerender } = render(
      <DrawerTab {...props}>
        <div>Active Content</div>
      </DrawerTab>
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
    const { rerender } = render(
      <DrawerTab {...props} active={true}>
        <div>Active Content</div>
      </DrawerTab>
    );
    expect(screen.getByText('Active Content')).toBeInTheDocument();
    rerender(
      <DrawerTab {...props} active={true} disabled={true}>
        <div>Active Content</div>
      </DrawerTab>
    );
    expect(screen.queryByText('Active Content')).not.toBeInTheDocument();
    expect(screen.getByText('Test Tab')).toBeInTheDocument();
  });
});
