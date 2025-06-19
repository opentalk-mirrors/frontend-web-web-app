// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
// the popup that appears after clicking on more-options => invite guest
// in the meeting room
import { Locator, Page } from '@playwright/test';

export class InviteGuestPopupPage {
  private readonly createInvitationButton: Locator;
  private readonly copyToClipboardButton: Locator;
  private readonly guestLinkText: Locator;

  constructor(page: Page) {
    this.createInvitationButton = page.getByRole('button', { name: 'Create' });
    this.copyToClipboardButton = page.getByRole('button', { name: 'Copy to Clipboard' });
    this.guestLinkText = page.locator('css=.MuiDialogContent-root');
  }

  async createInvitation() {
    await this.createInvitationButton.click();
    await this.copyToClipboardButton.waitFor();
  }

  async copyToClipboard() {
    await this.copyToClipboardButton.click();
  }

  async getGuestLink() {
    return await this.guestLinkText.innerText();
  }
}
