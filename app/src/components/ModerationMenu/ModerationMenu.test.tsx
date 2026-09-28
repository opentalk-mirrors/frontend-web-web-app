// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ModerationTabKey } from '../../config/constants';
import useTabs from '../../hooks/useTabs';
import { configureStore, renderWithProviders } from '../../utils/testUtils';
import ModerationMenu from './ModerationMenu';

vi.mock('../../hooks/useTabs', () => ({
  __esModule: true,
  default: vi.fn(),
}));

const mockedUseTabs = vi.mocked(useTabs);

const tabs = [
  { divider: false, key: ModerationTabKey.Home, titleKey: 'home-title' },
  { divider: false, key: ModerationTabKey.MuteUsers, titleKey: 'mute-participants-tab-title' },
  { divider: true, key: ModerationTabKey.Divider },
  { divider: false, key: ModerationTabKey.Breakout, tooltipTranslationKey: 'moderationbar-button-breakout-tooltip' },
  { divider: false, key: ModerationTabKey.Timer, titleKey: 'timer-tab-title', disabled: true },
];

const renderModerationMenu = () => {
  mockedUseTabs.mockReturnValue(tabs as ReturnType<typeof useTabs>);
  const { store } = configureStore();
  renderWithProviders(<ModerationMenu />, { store, provider: { mui: true } });
  return { store };
};

describe('<ModerationMenu />', () => {
  it('omits the home tab, which is reachable through the footer buttons', () => {
    renderModerationMenu();

    expect(screen.queryByRole('button', { name: 'home-title' })).not.toBeInTheDocument();
  });

  it('falls back to the tooltip when a tab has no title', () => {
    renderModerationMenu();

    expect(screen.getByRole('button', { name: 'moderationbar-button-breakout-tooltip' })).toBeInTheDocument();
  });

  it('opens the selected tool', async () => {
    const user = userEvent.setup();
    const { store } = renderModerationMenu();

    await user.click(screen.getByRole('button', { name: 'mute-participants-tab-title' }));

    expect(store.getState().ui.sidePanelView).toBe(ModerationTabKey.MuteUsers);
  });

  it('disables tools that are unavailable', () => {
    renderModerationMenu();

    // ListItemButton renders a div, so MUI conveys the disabled state via aria
    expect(screen.getByRole('button', { name: 'timer-tab-title' })).toHaveAttribute('aria-disabled', 'true');
  });
});
