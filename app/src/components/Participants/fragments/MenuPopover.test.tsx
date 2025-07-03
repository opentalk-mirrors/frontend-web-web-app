// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import MenuPopover, { IMenuOptionItem } from './MenuPopover';

describe('MenuPopover', () => {
  const setAnchorEl = jest.fn();
  const onClose = jest.fn();

  const options: IMenuOptionItem[] = [
    { i18nKey: 'option1', action: jest.fn() },
    { i18nKey: 'option2', action: jest.fn(), disabled: true },
  ];

  const anchorEl = document.createElement('div');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all menu options with translation', () => {
    render(
      <MenuPopover open={true} setAnchorEl={setAnchorEl} anchorEl={anchorEl} onClose={onClose} options={options} />
    );
    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems[0]).toBeInTheDocument();
    expect(menuItems[1]).toBeInTheDocument();
  });

  it('calls action when an enabled menu item is clicked', () => {
    render(
      <MenuPopover open={true} setAnchorEl={setAnchorEl} anchorEl={anchorEl} onClose={onClose} options={options} />
    );
    fireEvent.click(screen.getByRole('menuitem', { name: 'option1' }));
    expect(options[0].action).toHaveBeenCalled();
  });

  it('does have aria-disabled attribute when a menu item is disabled', () => {
    render(
      <MenuPopover open={true} setAnchorEl={setAnchorEl} anchorEl={anchorEl} onClose={onClose} options={options} />
    );
    const menuItem2 = screen.getByRole('menuitem', { name: 'option2' });
    expect(menuItem2).toHaveAttribute('aria-disabled');
  });

  it('does call close handler when popover is closed', async () => {
    render(
      <MenuPopover open={true} setAnchorEl={setAnchorEl} anchorEl={anchorEl} onClose={onClose} options={options} />
    );

    await userEvent.keyboard('{Escape}');

    expect(setAnchorEl).toHaveBeenCalledWith(undefined);
    expect(setAnchorEl).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
