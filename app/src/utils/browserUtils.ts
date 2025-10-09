// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

export function isFullscreenSupported(): boolean {
  return isBrowser() ? document.fullscreenEnabled : false;
}

export function getActive(): boolean {
  return isBrowser() ? document.fullscreenElement != null : false;
}

export function getDefaultTarget(): HTMLElement | null {
  return isBrowser() ? (document.documentElement as HTMLElement) : null;
}
