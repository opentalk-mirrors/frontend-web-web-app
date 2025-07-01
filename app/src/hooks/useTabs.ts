// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useMemo } from 'react';

import { ModerationTabKey } from '../config/constants';
import { tabs as initialTabs } from '../config/moderationTabs';
import { selectEnabledModulesList, selectConfigFeatures } from '../store/slices/configSlice';
import { selectCurrentRoomMode } from '../store/slices/roomSlice';
import { selectTimerStyle } from '../store/slices/timerSlice';
import { RoomMode, TimerStyle } from '../types';
import { useAppSelector } from './useCustomRedux';

// components should export the hook directly from here and not from `hooks/index.ts`
// otherwise it will cause circular dependencies
const useTabs = () => {
  const features = useAppSelector(selectConfigFeatures);
  const enabledModulesList = useAppSelector(selectEnabledModulesList);
  const enabledModules = useMemo(() => Object.keys(enabledModulesList).map((module) => module), [enabledModulesList]);
  const timerStyle = useAppSelector(selectTimerStyle);
  const currentRoomMode = useAppSelector(selectCurrentRoomMode);
  const isTimerCoffee = timerStyle === TimerStyle.CoffeeBreak;
  const isTimerNormal = timerStyle === TimerStyle.Normal;

  let tabs = initialTabs.filter(
    (tab) =>
      tab.divider ||
      (tab.featureKey && features[tab.featureKey]) ||
      (tab.moduleKey ? enabledModules.includes(tab.moduleKey) : false) ||
      tab.key === ModerationTabKey.Home
  );

  if (currentRoomMode === RoomMode.TalkingStick) {
    const enabledModulesForTalkingStickRoomMode = [ModerationTabKey.Home, ModerationTabKey.TalkingStick];

    tabs = tabs.map((tab) => {
      if (enabledModulesForTalkingStickRoomMode.includes(tab.key)) {
        return { ...tab, disabled: false };
      }
      return { ...tab, disabled: true };
    });
    return tabs;
  }

  tabs = tabs.map((tab) => ({ ...tab, disabled: false }));

  if (timerStyle !== undefined) {
    tabs = tabs.map((tab) => {
      if (isTimerNormal && tab.key === ModerationTabKey.CoffeeBreak) {
        return { ...tab, disabled: true };
      }
      if (isTimerCoffee && tab.key === ModerationTabKey.Timer) {
        return { ...tab, disabled: true };
      }
      return tab;
    });
  }

  return tabs;
};

export default useTabs;
