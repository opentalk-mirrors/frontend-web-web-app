// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../../utils/testUtils';
import SubmenuMenuItem, { type SubmenuEntry } from './SubMenuItem';

const TRIGGER_LABEL = 'Layout';
const ENTRY_GRID = 'Grid';
const ENTRY_SPEAKER = 'Speaker';

const renderSubmenu = (overrides?: { disabled?: boolean; submenu?: Array<SubmenuEntry> }) => {
  const gridAction = vi.fn();
  const speakerAction = vi.fn();
  const submenu: Array<SubmenuEntry> = overrides?.submenu ?? [
    { label: ENTRY_GRID, action: gridAction, selected: true },
    { label: ENTRY_SPEAKER, action: speakerAction },
  ];

  const view = renderWithProviders(
    <SubmenuMenuItem
      label={TRIGGER_LABEL}
      icon={<span data-testid="trigger-icon" />}
      disabled={overrides?.disabled}
      submenu={submenu}
    />,
    { provider: { mui: true } }
  );

  return { ...view, gridAction, speakerAction };
};

const getTriggerNode = (): HTMLElement => screen.getByRole('menuitem', { name: new RegExp(TRIGGER_LABEL) });

describe('SubmenuMenuItem', () => {
  afterEach(() => {
    vi.useRealTimers();
  });
  it('opens the submenu on click and shows all entries', async () => {
    const user = userEvent.setup();
    renderSubmenu();

    const trigger = getTriggerNode();
    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const submenu = screen.getByRole('menu', { name: TRIGGER_LABEL });
    expect(within(submenu).getByRole('menuitem', { name: ENTRY_GRID })).toBeInTheDocument();
    expect(within(submenu).getByRole('menuitem', { name: ENTRY_SPEAKER })).toBeInTheDocument();
  });

  it("invokes only the clicked entry's action", async () => {
    const user = userEvent.setup();
    const { gridAction, speakerAction } = renderSubmenu();

    await user.click(getTriggerNode());
    const submenu = screen.getByRole('menu', { name: TRIGGER_LABEL });
    await user.click(within(submenu).getByRole('menuitem', { name: ENTRY_SPEAKER }));

    expect(speakerAction).toHaveBeenCalledTimes(1);
    expect(gridAction).not.toHaveBeenCalled();
  });

  it('does not re-fire the action when an already-selected entry is clicked', async () => {
    const user = userEvent.setup();
    // Grid is already the selected entry
    const { gridAction, speakerAction } = renderSubmenu();

    await user.click(getTriggerNode());
    const submenu = screen.getByRole('menu', { name: TRIGGER_LABEL });
    await user.click(within(submenu).getByRole('menuitem', { name: ENTRY_GRID }));

    expect(gridAction).not.toHaveBeenCalled();
    expect(speakerAction).not.toHaveBeenCalled();
  });

  it('marks the selected entry visually (Mui-selected class)', async () => {
    const user = userEvent.setup();
    renderSubmenu();

    await user.click(getTriggerNode());

    expect(screen.getByRole('menuitem', { name: ENTRY_GRID })).toHaveClass('Mui-selected');
    expect(screen.getByRole('menuitem', { name: ENTRY_SPEAKER })).not.toHaveClass('Mui-selected');
  });

  it('marks the trigger as disabled and blocks pointer interaction when disabled', async () => {
    const user = userEvent.setup();
    renderSubmenu({ disabled: true });

    const trigger = getTriggerNode();
    expect(trigger).toHaveAttribute('aria-disabled', 'true');

    await expect(user.click(trigger)).rejects.toThrow(/pointer-events: none/);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('menu', { name: TRIGGER_LABEL })).not.toBeInTheDocument();
  });

  it('cancels a pending close when the trigger is re-entered before the timeout elapses', async () => {
    const user = userEvent.setup();
    renderSubmenu();

    const trigger = getTriggerNode();

    await user.hover(trigger);
    expect(screen.getByRole('menu', { name: TRIGGER_LABEL })).toBeInTheDocument();

    // Leaving schedules a short close timeout. Re-entering before it elapses
    // must clear the pending timeout so the menu stays open
    await user.unhover(trigger);
    await user.hover(trigger);

    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(screen.getByRole('menu', { name: TRIGGER_LABEL })).toBeInTheDocument();
  });

  it('closes shortly after the user leaves and stays out', async () => {
    const user = userEvent.setup();
    renderSubmenu();

    const trigger = getTriggerNode();

    await user.hover(trigger);
    expect(screen.getByRole('menu', { name: TRIGGER_LABEL })).toBeInTheDocument();

    await user.unhover(trigger);

    // The component schedules close after a short delay
    await waitFor(() => expect(screen.queryByRole('menu', { name: TRIGGER_LABEL })).not.toBeInTheDocument());
  });
});
