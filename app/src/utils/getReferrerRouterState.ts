// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2

/**
 * Construct route state object containing referrer field pointing to the
 * dependency injected pathname.
 */
export default function getReferrerRouterState(location: { pathname: string }) {
  return {
    referrer: location.pathname,
  };
}
