// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { type NavigateFunction } from 'react-router-dom';

let navigator: NavigateFunction | null = null;

export const setNavigator = (nav: NavigateFunction) => {
  navigator = nav;
};

/**
 * Navigate helper function used in non component files
 */
export const navigateTo = (path: string, options?: { replace?: boolean; state?: unknown }) => {
  if (!navigator) {
    throw new Error(`Navigator not set yet, cannot navigate to ${path}`);
  }

  navigator(path, { replace: options?.replace, state: options?.state });
};
