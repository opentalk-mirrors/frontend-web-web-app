// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { act, screen } from '@testing-library/react';
import { Mock } from 'vitest';

import { SIDE_PANEL_OFFSET_VARIABLE, SIDE_PANEL_WIDTH_PX } from '../../../constants';
import useConferenceUiVersion from '../../../hooks/useConferenceUiVersion';
import { fullscreenActions } from '../../../store/slices/fullscreen/slice';
import { closeSidePanel, initialState as uiInitialState, openSidePanel } from '../../../store/slices/uiSlice';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import { MenuTab } from '../../MenuTabs/fragments/constants';
import DesktopInnerLayout from './DesktopInnerLayout';

vi.mock('../../../hooks/useConferenceUiVersion', () => ({
  __esModule: true,
  default: vi.fn(),
}));

vi.mock('./DesktopInnerLayoutLegacy', () => ({
  __esModule: true,
  default: () => <div data-testid="desktop-inner-layout-legacy" />,
}));

// Keep the tree light: assert on the shared shells without pulling their heavy subtrees.
vi.mock('../../MeetingSidebar', () => ({
  __esModule: true,
  default: () => <div data-testid="meeting-sidebar" />,
}));
vi.mock('../../MeetingFooter', () => ({
  __esModule: true,
  default: () => <div data-testid="meeting-footer" />,
}));
vi.mock('../../MeetingHeader', () => ({
  __esModule: true,
  default: () => <div data-testid="meeting-header" />,
}));
vi.mock('./Cinema', () => ({
  __esModule: true,
  default: () => <div data-testid="cinema" />,
}));
vi.mock('../../Ballot', () => ({
  __esModule: true,
  default: () => null,
}));
vi.mock('../../JumpLinkContainer', () => ({
  __esModule: true,
  default: () => null,
}));
vi.mock('../../CoffeeBreakView', () => ({
  __esModule: true,
  default: () => null,
}));

const renderDesktopInnerLayout = (sidePanelView = uiInitialState.sidePanelView) => {
  const { store } = configureStore({ initialState: { ui: { ...uiInitialState, sidePanelView } } });
  return { ...renderWithProviders(<DesktopInnerLayout />, { store }), store };
};

const getNotificationOffset = () =>
  getComputedStyle(document.documentElement).getPropertyValue(SIDE_PANEL_OFFSET_VARIABLE);

describe('DesktopInnerLayout ui-version branching', () => {
  it('renders the legacy layout when v2 is not active', () => {
    (useConferenceUiVersion as Mock).mockReturnValue({ isV2: false });

    renderDesktopInnerLayout();

    expect(screen.getByTestId('desktop-inner-layout-legacy')).toBeInTheDocument();
    expect(screen.queryByTestId('meeting-footer')).not.toBeInTheDocument();
    expect(getNotificationOffset()).toBe('');
  });

  it('renders the new layout with a footer when v2 is active', () => {
    (useConferenceUiVersion as Mock).mockReturnValue({ isV2: true });

    renderDesktopInnerLayout();

    expect(screen.getByTestId('meeting-footer')).toBeInTheDocument();
    expect(screen.queryByTestId('desktop-inner-layout-legacy')).not.toBeInTheDocument();
  });
});

describe('DesktopInnerLayout side panel', () => {
  beforeEach(() => {
    (useConferenceUiVersion as Mock).mockReturnValue({ isV2: true });
  });

  it('renders the sidebar when a view is selected', () => {
    renderDesktopInnerLayout(MenuTab.Chat);

    expect(screen.getByTestId('meeting-sidebar')).toBeInTheDocument();
  });

  it('omits the sidebar when the panel is closed', () => {
    renderDesktopInnerLayout(null);

    expect(screen.queryByTestId('meeting-sidebar')).not.toBeInTheDocument();
    expect(screen.getByTestId('cinema')).toBeInTheDocument();
  });

  it('updates the notification offset when the panel closes and reopens', () => {
    const { store } = renderDesktopInnerLayout(MenuTab.Chat);

    expect(getNotificationOffset()).toContain(`${SIDE_PANEL_WIDTH_PX}px`);

    act(() => {
      store.dispatch(closeSidePanel());
    });
    expect(getNotificationOffset()).not.toContain(`${SIDE_PANEL_WIDTH_PX}px`);

    act(() => {
      store.dispatch(openSidePanel(MenuTab.People));
    });
    expect(getNotificationOffset()).toContain(`${SIDE_PANEL_WIDTH_PX}px`);
  });

  it('clears the offset in fullscreen and restores it on exit', () => {
    const { store } = renderDesktopInnerLayout(MenuTab.Chat);

    act(() => {
      store.dispatch(fullscreenActions.changed({ active: true }));
    });
    expect(getNotificationOffset()).not.toContain(`${SIDE_PANEL_WIDTH_PX}px`);

    act(() => {
      store.dispatch(fullscreenActions.changed({ active: false }));
    });
    expect(getNotificationOffset()).toContain(`${SIDE_PANEL_WIDTH_PX}px`);
  });
});
