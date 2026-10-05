// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Mock } from 'vitest';

import { MODERATION_MENU_VIEW, ModerationTabKey } from '../../config/constants';
import { SIDE_PANEL_ID } from '../../constants';
import useConferenceUiVersion from '../../hooks/useConferenceUiVersion';
import useTabs from '../../hooks/useTabs';
import { initialState as uiInitialState } from '../../store/slices/uiSlice';
import { Role } from '../../types';
import { configureStore, renderWithProviders } from '../../utils/testUtils';
import { MenuTab } from '../MenuTabs/fragments/constants';
import MeetingSidebar from './MeetingSidebar';

// import { Role } from '../../api/types/incoming/control';
// import { tabs } from '../../config/moderationTabs';
// import { render, screen, createStore, cleanup } from '../../utils/testUtils';
// import MeetingSidebar from './MeetingSidebar';

vi.mock('../Toolbar/fragments/EndCallButton', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="toolbarEndCallButton"></div>,
  };
});

vi.mock('../../hooks/useConferenceUiVersion', () => ({
  __esModule: true,
  default: vi.fn(),
}));

vi.mock('../../hooks/useTabs', () => ({
  __esModule: true,
  default: vi.fn(),
}));

vi.mock('../Chat', () => ({ __esModule: true, default: () => <div data-testid="chat" /> }));
vi.mock('../Participants', () => ({ __esModule: true, default: () => <div data-testid="participants" /> }));
vi.mock('../ChatOverview', () => ({ __esModule: true, default: () => <div data-testid="chat-overview" /> }));
vi.mock('../ModerationMenu', () => ({ __esModule: true, default: () => <div data-testid="moderation-menu" /> }));
vi.mock('./MeetingSidebarLegacy', () => ({ __esModule: true, default: () => <div data-testid="sidebar-legacy" /> }));

const moderationTabs = [
  { divider: false, key: ModerationTabKey.Home, component: <div /> },
  {
    divider: false,
    key: ModerationTabKey.MuteUsers,
    titleKey: 'mute-participants-tab-title',
    component: <div data-testid="mute-users" />,
  },
];

const renderMeetingSidebar = (
  { role, sidePanelView } = { role: Role.User, sidePanelView: uiInitialState.sidePanelView }
) => {
  (useConferenceUiVersion as Mock).mockReturnValue({ isV2: true });
  (useTabs as Mock).mockReturnValue(moderationTabs);
  const { store } = configureStore({
    initialState: { user: { role }, ui: { ...uiInitialState, sidePanelView } },
  });
  renderWithProviders(<MeetingSidebar />, { store, provider: { mui: true } });
  return { store };
};

describe('MeetingSidebar side panel', () => {
  it('renders the view selected in the footer', () => {
    renderMeetingSidebar({ role: Role.User, sidePanelView: MenuTab.Messages });

    expect(screen.getByTestId('chat-overview')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'global-messages' })).toBeInTheDocument();
  });

  it('exposes the panel as the region the footer buttons control', () => {
    renderMeetingSidebar();

    expect(screen.getByRole('region')).toHaveAttribute('id', SIDE_PANEL_ID);
  });

  it('closes the panel through the close button', async () => {
    const user = userEvent.setup();
    const { store } = renderMeetingSidebar({ role: Role.User, sidePanelView: MenuTab.Chat });

    await user.click(screen.getByRole('button', { name: 'side-panel-close-button-label' }));

    expect(store.getState().ui.sidePanelView).toBeNull();
  });

  it('closes the panel on escape', async () => {
    const user = userEvent.setup();
    const { store } = renderMeetingSidebar({ role: Role.User, sidePanelView: MenuTab.Chat });

    screen.getByRole('region').focus();
    await user.keyboard('{Escape}');

    expect(store.getState().ui.sidePanelView).toBeNull();
  });

  it('shows no back button on a top level view', () => {
    renderMeetingSidebar({ role: Role.Moderator, sidePanelView: MODERATION_MENU_VIEW });

    expect(screen.getByTestId('moderation-menu')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'side-panel-back-button-label' })).not.toBeInTheDocument();
  });

  it('returns from a moderation tool to the moderation menu', async () => {
    const user = userEvent.setup();
    const { store } = renderMeetingSidebar({ role: Role.Moderator, sidePanelView: ModerationTabKey.MuteUsers });

    expect(screen.getByTestId('mute-users')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'side-panel-back-button-label' }));

    expect(store.getState().ui.sidePanelView).toBe(MODERATION_MENU_VIEW);
  });

  it('falls back to chat when a participant holds a moderation view', () => {
    renderMeetingSidebar({ role: Role.User, sidePanelView: ModerationTabKey.MuteUsers });

    expect(screen.getByTestId('chat')).toBeInTheDocument();
    expect(screen.queryByTestId('mute-users')).not.toBeInTheDocument();
  });
});

describe.skip('MeetingSidebar', () => {
  it('placeholder test', () => {
    expect(1 + 1).toEqual(2);
  });
  //WARNING: Skip does not prevent the test from failing so we have temporarily commented out the tests.
  //TODO: Investigate and fix tests as part of https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1402
  // afterEach(() => cleanup());

  // it('render MeetingSidebar component without crashing for user with role of moderator', async () => {
  // const { store } = createStore({
  //   initialState: {
  //     auth: { isAuthed: true },
  //     user: { loggedIn: true, role: Role.Moderator },
  //   },
  // });
  //   await render(<MeetingSidebar />, store);

  //   expect(screen.getByTestId('Toolbar')).toBeInTheDocument();
  //   expect(screen.getByTestId('toolbarHandraiseButton')).toBeInTheDocument();
  //   expect(screen.getByTestId('toolbarBlurScreenButton')).toBeInTheDocument();
  //   expect(screen.getByTestId('toolbarAudioButton')).toBeInTheDocument();
  //   expect(screen.getByTestId('toolbarVideoButton')).toBeInTheDocument();
  //   expect(screen.getByTestId('toolbarMenuButton')).toBeInTheDocument();
  //   expect(screen.getByTestId('toolbarEndCallButton')).toBeInTheDocument();

  //   expect(screen.getByTestId('Toolbar')).toHaveAttribute('role', 'tablist');
  // });

  // it('render MeetingSidebar component without crashing for user with role of guest', async () => {
  //   const { store } = createStore({
  //     initialState: {
  //       auth: { isAuthed: true },
  //       user: { loggedIn: true, role: Role.Guest },
  //       ui: {
  //         chatConversationState: {
  //           scope: undefined,
  //           targetId: undefined,
  //         },
  //       },
  //     },
  //   });
  //   const tabsNames = tabs.map((tab) => tab.tooltipTranslationKey).filter((name) => name !== undefined);

  //   await render(<MeetingSidebar />, store);

  //   expect(screen.getByTestId('Toolbar')).toBeInTheDocument();
  //   expect(screen.getByTestId('toolbarHandraiseButton')).toBeInTheDocument();
  //   expect(screen.getByTestId('toolbarBlurScreenButton')).toBeInTheDocument();
  //   expect(screen.getByTestId('toolbarAudioButton')).toBeInTheDocument();
  //   expect(screen.getByTestId('toolbarVideoButton')).toBeInTheDocument();
  //   expect(screen.getByTestId('toolbarMenuButton')).toBeInTheDocument();
  //   expect(screen.getByTestId('toolbarEndCallButton')).toBeInTheDocument();

  //   expect(screen.getByTestId('Toolbar')).toHaveAttribute('role', 'tablist');
  //   tabsNames.map((name) => expect(screen.queryByLabelText(name as string)).not.toBeInTheDocument());

  //   expect(screen.getByText('menutabs-chat')).toBeInTheDocument();
  //   expect(screen.getByText('menutabs-people')).toBeInTheDocument();
  //   expect(screen.getByText('global-messages')).toBeInTheDocument();
  // });
});
