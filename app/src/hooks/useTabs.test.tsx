// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { BackendModules } from '@opentalk/rest-api-rtk-query';
import { renderHook } from '@testing-library/react';
import { Provider as ReduxProvider } from 'react-redux';

import { ModerationTabKey } from '../config/constants';
import { Tab } from '../config/moderationTabs';
import { RoomMode, TimerStyle } from '../types';
import { configureStore } from '../utils/testUtils';
import useTabs from './useTabs';

vi.mock('../config/moderationTabs', async () => {
  return {
    tabs: [
      { key: 'tab-home', featureKey: undefined, moduleKey: undefined, divider: false },
      { key: 'tab-timer', featureKey: BackendModules.Timer, moduleKey: undefined, divider: false },
      { key: 'tab-coffee-break', featureKey: BackendModules.Timer, moduleKey: undefined, divider: false },
      { key: 'tab-talking-stick', featureKey: undefined, moduleKey: BackendModules.Automod, divider: false },
    ],
    Tab: {},
  };
});

describe('useTabs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns only tabs with enabled features or modules', () => {
    const { store } = configureStore({
      initialState: {
        config: {
          features: { timer: true, coffee: false },
          enabledModules: [BackendModules.Automod],
        },
      },
    });

    const { result } = renderHook(() => useTabs(), {
      wrapper: ({ children }) => <ReduxProvider store={store}>{children}</ReduxProvider>,
    });

    expect(result.current.map((tab: Tab) => tab.key)).toEqual([
      ModerationTabKey.Home,
      ModerationTabKey.Timer,
      ModerationTabKey.CoffeeBreak,
      ModerationTabKey.TalkingStick,
    ]);
  });

  it('sets all tabs enabled if no RoomMode and no TimerStyle is set', () => {
    const { store } = configureStore({
      initialState: {
        config: {
          features: { timer: true, coffee: false },
          enabledModules: [],
        },
      },
    });

    const { result } = renderHook(() => useTabs(), {
      wrapper: ({ children }) => <ReduxProvider store={store}>{children}</ReduxProvider>,
    });

    expect(result.current.every((tab: Tab) => tab.disabled === false)).toBe(true);
  });

  it('disables all tabs except Home and TalkingStick in TalkingStick mode', () => {
    const { store } = configureStore({
      initialState: {
        config: {
          features: { timer: true, coffee: true, talkingStick: true },
          enabledModules: [BackendModules.Automod, BackendModules.Timer],
        },
        room: {
          currentMode: RoomMode.TalkingStick,
        },
      },
    });

    const { result } = renderHook(() => useTabs(), {
      wrapper: ({ children }) => <ReduxProvider store={store}>{children}</ReduxProvider>,
    });

    const homeTab = result.current.find((tab: Tab) => tab.key === ModerationTabKey.Home);
    const talkingStickTab = result.current.find((tab: Tab) => tab.key === ModerationTabKey.TalkingStick);
    const timerTab = result.current.find((tab: Tab) => tab.key === ModerationTabKey.Timer);
    const coffeeBreakTab = result.current.find((tab: Tab) => tab.key === ModerationTabKey.CoffeeBreak);

    expect(homeTab?.disabled).toBe(false);
    expect(talkingStickTab?.disabled).toBe(false);
    expect(timerTab?.disabled).toBe(true);
    expect(coffeeBreakTab?.disabled).toBe(true);
  });

  it('disables CoffeeBreak tab in TimerStyle.Normal', () => {
    const { store } = configureStore({
      initialState: {
        config: {
          features: { timer: true, coffee: true },
          enabledModules: [BackendModules.Automod, BackendModules.Timer],
        },
        timer: {
          style: TimerStyle.Normal,
        },
      },
    });

    const { result } = renderHook(() => useTabs(), {
      wrapper: ({ children }) => <ReduxProvider store={store}>{children}</ReduxProvider>,
    });

    const coffeeBreakTab = result.current.find((tab: Tab) => tab.key === ModerationTabKey.CoffeeBreak);
    const timerTab = result.current.find((tab: Tab) => tab.key === ModerationTabKey.Timer);

    expect(coffeeBreakTab?.disabled).toBe(true);
    expect(timerTab?.disabled).toBe(false);
  });

  it('disables Timer tab in TimerStyle.CoffeeBreak', () => {
    const { store } = configureStore({
      initialState: {
        config: {
          features: { timer: true, coffee: true },
          enabledModules: [BackendModules.Automod, BackendModules.Timer],
        },
        timer: {
          style: TimerStyle.CoffeeBreak,
        },
      },
    });

    const { result } = renderHook(() => useTabs(), {
      wrapper: ({ children }) => <ReduxProvider store={store}>{children}</ReduxProvider>,
    });

    const timerTab = result.current.find((tab: Tab) => tab.key === ModerationTabKey.Timer);
    const coffeeBreakTab = result.current.find((tab: Tab) => tab.key === ModerationTabKey.CoffeeBreak);

    expect(timerTab?.disabled).toBe(true);
    expect(coffeeBreakTab?.disabled).toBe(false);
  });
});
