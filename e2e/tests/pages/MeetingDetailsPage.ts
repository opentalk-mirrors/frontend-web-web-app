// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Page, Locator } from '@playwright/test';

export class MeetingDetailsPage {
  private page: Page;
  private readonly meetingLinkInput: Locator;
  private readonly guestLinkInput: Locator;
  private readonly copyMeetingLinkButton: Locator;
  private readonly copyGuestLinkButton: Locator;
  private readonly finishedCopyButtonText: string;

  constructor({ page }: { page: Page }) {
    this.page = page;
    this.meetingLinkInput = this.page.getByLabel('Meeting-Link');
    this.guestLinkInput = this.page.getByLabel('Guest-Link');
    this.copyMeetingLinkButton = this.page.getByRole('button', { name: new RegExp('Copy Room link for .+') });
    this.copyGuestLinkButton = this.page.getByRole('button', { name: new RegExp('Copy guest room link for .+') });
    this.finishedCopyButtonText = 'Copied';
  }

  async getMeetingLink(): Promise<string> {
    await this.meetingLinkInput.waitFor({ state: 'visible' });
    await this.waitForTypeOfInputToBeText(this.meetingLinkInput);
    return this.meetingLinkInput.inputValue();
  }

  async getGuestLink(): Promise<string> {
    await this.guestLinkInput.waitFor({ state: 'visible' });
    await this.waitForTypeOfInputToBeText(this.guestLinkInput);

    // the guest link has the value '-' when page is loaded, and later it contains only the
    // moderator link and at the end it finally contains the guest link
    // so we need to wait until it changes
    let value: string;
    do {
      value = await this.guestLinkInput.inputValue();
    } while (!value.includes('?invite='));
    return value;
  }

  private async waitForTypeOfInputToBeText(locator: Locator): Promise<void> {
    // when the page is loaded the type of the field is wrong for a while
    // it only becomes an input field after a while
    let type: string;
    do {
      type = await locator.getAttribute('type');
    } while (type !== 'text');
  }

  async copyMeetingLinkToClipboard() {
    await this.copyMeetingLinkButton.click();
    await this.copyMeetingLinkButton.getByText(this.finishedCopyButtonText).waitFor();
  }

  async copyGuestLinkToClipboard() {
    await this.copyGuestLinkButton.click();
    await this.copyGuestLinkButton.getByText(this.finishedCopyButtonText).waitFor();
  }
}
