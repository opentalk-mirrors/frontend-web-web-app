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

    expect(setAnchorEl).toHaveBeenCalledExactlyOnceWith(undefined);
    expect(onClose).toHaveBeenCalledExactlyOnceWith();
  });

  it('follows its anchor on the frame after a window resize', () => {
    const anchor = document.createElement('button');
    document.body.append(anchor);
    const anchorRect = vi.spyOn(anchor, 'getBoundingClientRect');
    anchorRect.mockReturnValue(new DOMRect(100, 100, 20, 20));
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => frames.push(callback));

    render(<ParticipantMenu id="" open={true} setAnchorEl={setAnchorEl} anchorEl={anchor} options={options} />);
    // eslint-disable-next-line testing-library/no-node-access -- MUI positions the paper, which has no role
    const paper = screen.getByRole('menu').parentElement as HTMLElement;
    const initialLeft = paper.style.left;

    anchorRect.mockReturnValue(new DOMRect(400, 100, 20, 20));
    fireEvent(window, new Event('resize'));
    frames.forEach((frame) => frame(0));

    expect(paper.style.left).not.toBe(initialLeft);
    anchor.remove();
  });
});
