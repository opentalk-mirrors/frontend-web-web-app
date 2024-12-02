// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { openUserManual, USER_MANUAL_URL } from './apiUtils';

describe('api utils', () => {
  it('opens user manual in new tab', () => {
    const restoreWindowOpen = window.open;
    window.open = jest.fn();

    openUserManual();

    expect(window.open).toHaveBeenCalledWith(USER_MANUAL_URL, '_blank');

    window.open = restoreWindowOpen;
  });
});
