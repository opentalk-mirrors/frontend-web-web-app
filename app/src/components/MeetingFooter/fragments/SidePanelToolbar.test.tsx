// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MODERATION_MENU_VIEW, ModerationTabKey } from '../../../config/constants';
import { initialState as uiInitialState } from '../../../store/slices/uiSlice';
import { Role } from '../../../types';
import { isModerationView } from '../../../utils/isModerationView';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import { MenuTab } from '../../MenuTabs/fragments/constants';
import SidePanelToolbar from './SidePanelToolbar';

const renderSidePanelToolbar = (
  { role, sidePanelView } = { role: Role.User, sidePanelView: uiInitialState.sidePanelView }
) => {
  const { store } = configureStore({
    initialState: {
      user: { role },
      ui: {
        ...uiInitialState,
        sidePanelView,
        lastModerationView: isModerationView(sidePanelView) ? sidePanelView : uiInitialState.lastModerationView,
      },
    },
  });
  renderWithProviders(<SidePanelToolbar />, { store, provider: { mui: true } });
  return { store };
};

describe('<SidePanelToolbar />', () => {
  it('renders the chat, people and messages buttons for a participant', () => {
    renderSidePanelToolbar();

    expect(screen.getByRole('button', { name: 'global-chat' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'global-participants' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'global-messages' })).toBeInTheDocument();
  });

  it('hides the moderation button from participants', () => {
    renderSidePanelToolbar();

    expect(screen.queryByRole('button', { name: 'toolbar-button-moderation-tooltip-title' })).not.toBeInTheDocument();
  });

  it('shows the moderation button to moderators', () => {
    renderSidePanelToolbar({ role: Role.Moderator, sidePanelView: uiInitialState.sidePanelView });

    expect(screen.getByRole('button', { name: 'toolbar-button-moderation-tooltip-title' })).toBeInTheDocument();
  });

  it('opens the requested view', async () => {
    const user = userEvent.setup();
    const { store } = renderSidePanelToolbar({ role: Role.User, sidePanelView: MenuTab.Chat });

    await user.click(screen.getByRole('button', { name: 'global-messages' }));

    expect(store.getState().ui.sidePanelView).toBe(MenuTab.Messages);
  });

  it('closes the panel when the active view is clicked again', async () => {
    const user = userEvent.setup();
    const { store } = renderSidePanelToolbar({ role: Role.User, sidePanelView: MenuTab.Chat });

    await user.click(screen.getByRole('button', { name: 'global-chat' }));

    expect(store.getState().ui.sidePanelView).toBeNull();
  });

  it('opens the moderation overview for moderators', async () => {
    const user = userEvent.setup();
    const { store } = renderSidePanelToolbar({ role: Role.Moderator, sidePanelView: MenuTab.Chat });

    await user.click(screen.getByRole('button', { name: 'toolbar-button-moderation-tooltip-title' }));

    expect(store.getState().ui.sidePanelView).toBe(MODERATION_MENU_VIEW);
  });

  it('marks only the displayed view as expanded', () => {
    renderSidePanelToolbar({ role: Role.User, sidePanelView: MenuTab.People });

    expect(screen.getByRole('button', { name: 'global-participants' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'global-chat' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps the moderation button active while a moderation tool is open', () => {
    renderSidePanelToolbar({ role: Role.Moderator, sidePanelView: ModerationTabKey.Breakout });

    expect(screen.getByRole('button', { name: 'toolbar-button-moderation-tooltip-title' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });

  it('closes the panel when pressed while a moderation tool is open', async () => {
    const user = userEvent.setup();
    const { store } = renderSidePanelToolbar({ role: Role.Moderator, sidePanelView: ModerationTabKey.Polls });

    await user.click(screen.getByRole('button', { name: 'toolbar-button-moderation-tooltip-title' }));

    expect(store.getState().ui.sidePanelView).toBeNull();
  });

  it('reopens the moderation tool that was displayed last', async () => {
    const user = userEvent.setup();
    const { store } = renderSidePanelToolbar({ role: Role.Moderator, sidePanelView: ModerationTabKey.Polls });
    const moderationButton = screen.getByRole('button', { name: 'toolbar-button-moderation-tooltip-title' });

    await user.click(moderationButton);
    await user.click(moderationButton);

    expect(store.getState().ui.sidePanelView).toBe(ModerationTabKey.Polls);
  });
});
