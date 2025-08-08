// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ParticipantMenu, { ParticipantMenuOption } from './ParticipantMenu';

describe('ParticipantMenu', () => {
  const setAnchorEl = vi.fn();
  const onClose = vi.fn();

  const options: ParticipantMenuOption[] = [
    { i18nKey: 'option1', action: vi.fn() },
    { i18nKey: 'option2', action: vi.fn(), disabled: true },
  ];

  const anchorEl = document.createElement('div');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders menu and all menu options with translation', () => {
    render(
      <ParticipantMenu
        id=""
        open={true}
        setAnchorEl={setAnchorEl}
        anchorEl={anchorEl}
        onClose={onClose}
        options={options}
      />
    );
    expect(screen.getByRole('menu', { name: 'participant-menu-label' })).toBeInTheDocument();
    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems[0]).toBeInTheDocument();
    expect(menuItems[1]).toBeInTheDocument();
  });

  it('calls action when an enabled menu item is clicked', () => {
    render(
      <ParticipantMenu
        id=""
        open={true}
        setAnchorEl={setAnchorEl}
        anchorEl={anchorEl}
        onClose={onClose}
        options={options}
      />
    );
    fireEvent.click(screen.getByRole('menuitem', { name: 'option1' }));
    expect(options[0].action).toHaveBeenCalled();
  });

  it('does have aria-disabled attribute when a menu item is disabled', () => {
    render(
      <ParticipantMenu
        id=""
        open={true}
        setAnchorEl={setAnchorEl}
        anchorEl={anchorEl}
        onClose={onClose}
        options={options}
      />
    );
    const menuItem2 = screen.getByRole('menuitem', { name: 'option2' });
    expect(menuItem2).toHaveAttribute('aria-disabled');
  });

  it('does call close handler when popover is closed', async () => {
    render(
      <ParticipantMenu
        id=""
        open={true}
        setAnchorEl={setAnchorEl}
        anchorEl={anchorEl}
        onClose={onClose}
        options={options}
      />
    );

    await userEvent.keyboard('{Escape}');

    expect(setAnchorEl).toHaveBeenCalledWith(undefined);
    expect(setAnchorEl).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
