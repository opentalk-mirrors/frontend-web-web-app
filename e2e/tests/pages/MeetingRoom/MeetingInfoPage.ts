// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
// the popup that appears after clicking on more-options => invite guest
// in the meeting room
import { Locator, Page } from '@playwright/test';

export class MeetingInfoPage {
  private readonly copyInviteLinkButton: Locator;
  private readonly copyDialInNumButton: Locator;
  private readonly copyPasswordButton: Locator;

  public readonly page: Page;
  public readonly inviteLinkInputField: Locator;
  public readonly dialInNumberInputField: Locator;
  public readonly passwordInputField: Locator;
  public readonly clipBoardButton: Locator;
  public readonly eMailButton: Locator;
  public readonly linkCopiedToClipboardPopup: Locator;
  public readonly dialInCopiedToClipboardPopup: Locator;
  public readonly passwordCopiedToClipboardPopup: Locator;
  public readonly detailsCopiedToClipboardPopup: Locator;

  constructor(page: Page) {
    this.page = page;
    this.inviteLinkInputField = this.page.getByRole('textbox', { name: 'Invite Link' });
    this.dialInNumberInputField = this.page.getByRole('textbox', { name: 'Dial-in Number' });
    this.passwordInputField = this.page.getByRole('textbox', { name: 'Password' });
    this.clipBoardButton = this.page.getByRole('button', { name: 'Clipboard' });
    this.eMailButton = this.page.getByRole('button', { name: 'E-Mail' });
    this.copyInviteLinkButton = this.page.getByRole('button', { name: 'Copy Invite Link for ' });
    this.copyDialInNumButton = this.page.getByRole('button', { name: 'Copy Dial-in Number for ' });
    this.copyPasswordButton = this.page.getByRole('button', { name: 'Copy Password for ' });
    this.linkCopiedToClipboardPopup = this.page.getByText('The link was copied to your clipboard');
    this.dialInCopiedToClipboardPopup = this.page.getByText('The telephone dial-in was copied to the clipboard');
    this.passwordCopiedToClipboardPopup = this.page.getByText('The password was copied to your clipboard');
    this.detailsCopiedToClipboardPopup = this.page.getByText('Details were copied to your clipboard');
  }

  public async copyInviteLinkToClipboard() {
    await this.copyInviteLinkButton.click();
  }

  public async copyDialInNumberToClipboard() {
    await this.copyDialInNumButton.click();
  }

  public async copyMeetingDetailsToClipboard() {
    await this.clipBoardButton.click();
  }

  public async copyPasswordToClipboard() {
    await this.copyPasswordButton.click();
  }
}
