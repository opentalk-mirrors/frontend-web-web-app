// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
// everything in the menu that opens when one clicks the 3 dot in the personal control bar
// inside the main MeetingRoom
import { Locator, Page } from '@playwright/test';

import { InviteGuestPopupPage } from './InviteGuestPopupPage';

export class MoreOptionsPage {
  page: Page;
  inviteGuestItem: Locator;

  constructor(page: Page) {
    this.page = page;
    this.inviteGuestItem = page.getByText('Invite guest');
  }

  async inviteGuest(): Promise<InviteGuestPopupPage> {
    await this.inviteGuestItem.click();
    return new InviteGuestPopupPage(this.page);
  }
}
