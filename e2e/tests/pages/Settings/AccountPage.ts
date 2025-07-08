// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Page, Locator } from '@playwright/test';

export class AccountPage {
  private readonly page: Page;

  public readonly generalInformationHeading: Locator;
  public readonly emailTextbox: Locator;
  public readonly firstNameTextbox: Locator;
  public readonly familyNameTextbox: Locator;
  constructor(page: Page) {
    this.page = page;

    this.generalInformationHeading = this.page.getByRole('heading', { name: 'General Information' });
    this.emailTextbox = this.page.getByRole('textbox', { name: 'E-Mail Address' });
    this.firstNameTextbox = this.page.getByRole('textbox', { name: 'First Name' });
    this.familyNameTextbox = this.page.getByRole('textbox', { name: 'Family Name' });
  }

  public async focusEmailAddressField() {
    await this.emailTextbox.click();
  }

  public async focusFirstNameField() {
    await this.firstNameTextbox.click();
  }

  public async focusFamilyNameField() {
    await this.familyNameTextbox.click();
  }
}
