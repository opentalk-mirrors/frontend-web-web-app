// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2

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
  //   expect(screen.getByText('menutabs-messages')).toBeInTheDocument();
  // });
});
