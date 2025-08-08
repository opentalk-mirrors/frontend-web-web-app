// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, screen } from '@testing-library/react';
import { Mock } from 'vitest';

import { ModerationTabKey } from '../../../../config/constants';
import useTabs from '../../../../hooks/useTabs';
import { configureStore, renderWithProviders } from '../../../../utils/testUtils';
import Drawer from './Drawer';

vi.mock('../../../../hooks/useTabs', () => ({
  __esModule: true,
  default: vi.fn(),
}));

vi.mock('../../../../config/moderationTabs', () => {
  const originalModule = vi.importActual('../../../../config/moderationTabs');
  return {
    ...originalModule,
    SupportMenuMobileTab: {
      key: 'tab-support-menu' as ModerationTabKey,
      component: <div>SupportMenu</div>,
      titleKey: 'support-menu-tab-title',
    },
    PollsAndVotesMobileTab: {
      key: 'tab-polls-voting' as ModerationTabKey,
      component: <div>PollsAndVotesMobileTab</div>,
      titleKey: 'votes-poll-overview-title',
    },
    WaitingRoomMobileTab: {
      key: 'tab-waiting-room' as ModerationTabKey,
      component: <div>WaitingRoomMobileTab</div>,
      titleKey: 'waiting-room-tab-title',
    },
  };
});

vi.mock('./DrawerButton', () => ({
  __esModule: true,
  DrawerButton: (props: { onClick: () => void; expanded: boolean }) => (
    <button type="button" onClick={props.onClick} data-expanded={props.expanded}>
      DrawerButton
    </button>
  ),
}));

describe('Drawer rendering logic', () => {
  const { store } = configureStore({
    initialState: {
      user: {
        role: 'user',
      },
    },
  });

  beforeEach(() => {
    (useTabs as Mock).mockReturnValue([]);
  });

  it('should not render drawer content when its closed', () => {
    renderWithProviders(<Drawer />, { store });
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});

describe('Drawer behavior logic', () => {
  beforeEach(() => {
    (useTabs as Mock).mockReturnValue([]);
  });

  it('should open drawer when drawer button is clicked', () => {
    const { store } = configureStore({
      initialState: {
        user: {
          role: 'user',
        },
        ui: {
          isDrawerOpen: false,
        },
      },
    });
    renderWithProviders(<Drawer />, { store });
    fireEvent.click(screen.getByText('DrawerButton'));
    expect(screen.getByText('DrawerButton')).toHaveProperty('dataset.expanded', 'true');
  });

  it("should close drawer when it's open and button is clicked", () => {
    const { store } = configureStore({
      initialState: {
        user: {
          role: 'user',
        },
        ui: {
          isDrawerOpen: true,
        },
      },
    });
    renderWithProviders(<Drawer />, { store });
    fireEvent.click(screen.getByText('DrawerButton'));
    expect(screen.getByText('DrawerButton')).toHaveProperty('dataset.expanded', 'false');
  });
});

describe('Drawer participant tabs', () => {
  beforeEach(() => {
    (useTabs as Mock).mockReturnValue([{ divider: false, key: ModerationTabKey.Home, component: <div>home</div> }]);
  });

  it('should only render home and support tabs', () => {
    const { store } = configureStore({
      initialState: {
        user: {
          role: 'user',
        },
        ui: {
          isDrawerOpen: true,
        },
        legalVote: {
          votes: {
            ids: [],
            entities: {},
          },
        },
      },
    });
    renderWithProviders(<Drawer />, { store });
    const container = screen.getByRole('list');
    expect(container).toBeInTheDocument();
    expect(container).toHaveProperty('children.length', 2);
  });

  it('renders polls and votes mobile tab on top of other tabs when present', () => {
    const { store } = configureStore({
      initialState: {
        user: {
          role: 'user',
        },
        ui: {
          isDrawerOpen: true,
        },
        legalVote: {
          votes: {
            ids: ['1'],
            entities: { '1': { id: '1', state: 'active', votes: { yes: 0, no: 0, abstain: 0 }, votingRecord: {} } },
          },
        },
      },
    });
    renderWithProviders(<Drawer />, { store });
    const firstItem = screen.getAllByRole('listitem')[0];
    expect(firstItem).toHaveTextContent('votes-poll-overview-title');
  });
});

describe('Drawer moderator tabs', () => {
  beforeEach(() => {
    (useTabs as Mock).mockReturnValue([
      { divider: false, key: ModerationTabKey.Home, component: <div>home</div> },
      { divider: false, key: ModerationTabKey.MuteUsers, component: <div>mute</div> },
      { divider: true, key: ModerationTabKey.Divider, component: <div>divider</div> },
      { divider: false, key: ModerationTabKey.ResetHandraises, component: <div>reset</div> },
      { divider: false, key: ModerationTabKey.TalkingStick, component: <div>talking stick</div> },
      { divider: true, key: ModerationTabKey.Divider, component: <div>divider</div> },
    ]);
  });

  it('should omits divider tabs.', () => {
    const { store } = configureStore({
      initialState: {
        user: {
          role: 'moderator',
        },
        ui: {
          isDrawerOpen: true,
        },
        legalVote: {
          votes: {
            ids: ['1'],
            entities: { '1': { id: '1', state: 'active', votes: { yes: 0, no: 0, abstain: 0 }, votingRecord: {} } },
          },
        },
      },
    });
    renderWithProviders(<Drawer />, { store });
    const container = screen.getByRole('list');
    expect(container).toBeInTheDocument();
    expect(container).toHaveProperty('children.length', 5); // 2 dividers are omitted and one mobile only tab is included.
  });

  it('should open waiting room tab when drawer button is clicked and there are queued participants', () => {
    const { store } = configureStore({
      initialState: {
        user: {
          role: 'moderator',
        },
        ui: {
          isDrawerOpen: false,
          activeTab: 'home',
        },
        legalVote: {
          votes: {
            ids: ['1'],
            entities: { '1': { id: '1', state: 'active', votes: { yes: 0, no: 0, abstain: 0 }, votingRecord: {} } },
          },
        },
        participants: {
          ids: ['1'],
          entities: { 1: { id: '1', name: 'Participant 1', waitingRoom: true } },
        },
      },
    });
    renderWithProviders(<Drawer />, { store });
    const button = screen.getByText('DrawerButton');
    fireEvent.click(button);
    expect(screen.getByText('DrawerButton')).toHaveProperty('dataset.expanded', 'true');
    expect(store.getState().ui.activeTab).toBe(ModerationTabKey.WaitingRoom);
  });
});
