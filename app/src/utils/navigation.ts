// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { type NavigateFunction } from 'react-router-dom';

let navigator: NavigateFunction | null = null;
let pendingNavigation: Array<{ path: string; options?: { replace?: boolean; state?: unknown } }> = [];

export const setNavigator = (nav: NavigateFunction) => {
  navigator = nav;
  if (pendingNavigation.length > 0) {
    const lastNav = pendingNavigation.at(-1);
    lastNav && navigator(lastNav.path, { replace: true, ...lastNav.options });
    pendingNavigation = [];
  }
};

/**
 * Navigate helper function used in non component files
 */
export const navigateTo = (path: string, options?: { replace?: boolean; state?: unknown }) => {
  if (!navigator) {
    pendingNavigation.push({ path, options });
    return;
  }

  navigator(path, { replace: options?.replace, state: options?.state });
};
