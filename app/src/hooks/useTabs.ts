// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useCallback, useEffect, useMemo, useState } from 'react';

import { ModerationTabKey } from '../config/constants';
import { Tab, tabs as initialTabs } from '../config/moderationTabs';
import { selectEnabledModulesList, selectConfigFeatures } from '../store/slices/configSlice';
import { selectCurrentRoomMode } from '../store/slices/roomSlice';
import { selectTimerStyle } from '../store/slices/timerSlice';
import { selectActiveTab, setActiveTab } from '../store/slices/uiSlice';
import { selectIsModerator } from '../store/slices/userSlice';
import { RoomMode, TimerStyle } from '../types';
import { useAppDispatch, useAppSelector } from './useCustomRedux';

// components should export the hook directly from here and not from `hooks/index.ts`
// otherwise it will cause circular dependencies
const useTabs = () => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const features = useAppSelector(selectConfigFeatures);
  const enabledModulesList = useAppSelector(selectEnabledModulesList);
  const enabledModules = useMemo(() => Object.keys(enabledModulesList).map((module) => module), [enabledModulesList]);
  const timerStyle = useAppSelector(selectTimerStyle);
  const currentRoomMode = useAppSelector(selectCurrentRoomMode);
  const isModerator = useAppSelector(selectIsModerator);
  const activeTab = useAppSelector(selectActiveTab);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Only tabs with module key are conditional, otherwise they are always shown.
    const tabsFirstFilter = initialTabs.filter(
      (tab) =>
        tab.divider ||
        (tab.featureKey && features[tab.featureKey]) ||
        (tab.moduleKey ? enabledModules.includes(tab.moduleKey) : false)
    );
    setTabs(tabsFirstFilter);
  }, [enabledModules, features]);

  const setDisabledTabs = useCallback(() => {
    if (!currentRoomMode && !timerStyle) {
      // We assume that the tabs are already filtered by the enabled module.
      return setTabs((tabs) => tabs.map((tab) => ({ ...tab, disabled: false })));
    }

    if (currentRoomMode === RoomMode.TalkingStick) {
      const enabledModules = [ModerationTabKey.Home, ModerationTabKey.TalkingStick];
      dispatch(setActiveTab(ModerationTabKey.TalkingStick));
      return setTabs((tabs) =>
        tabs.map((tab) => {
          if (enabledModules.includes(tab.key)) {
            return { ...tab, disabled: false };
          }
          return { ...tab, disabled: true };
        })
      );
    }

    const isTimerCoffee = timerStyle === TimerStyle.CoffeeBreak;
    const isTimerNormal = timerStyle === TimerStyle.Normal;

    //Forced redirection for other moderators than the one starting a timer to avoid them being on a disabled tab.
    if (currentRoomMode === RoomMode.CoffeeBreak && isModerator && activeTab === ModerationTabKey.Timer) {
      dispatch(setActiveTab(ModerationTabKey.Home));
    }
    if (isTimerNormal && isModerator && activeTab === ModerationTabKey.CoffeeBreak) {
      dispatch(setActiveTab(ModerationTabKey.Home));
    }

    return setTabs((tabs) =>
      tabs.map((tab) => {
        if (isTimerNormal && tab.key === ModerationTabKey.CoffeeBreak) {
          return { ...tab, disabled: true };
        }
        if (isTimerCoffee && tab.key === ModerationTabKey.Timer) {
          return { ...tab, disabled: true };
        }
        return { ...tab, disabled: false };
      })
    );
  }, [tabs, timerStyle, currentRoomMode]);

  useEffect(() => {
    setDisabledTabs();
  }, [timerStyle, currentRoomMode]);

  return tabs;
};

export default useTabs;
