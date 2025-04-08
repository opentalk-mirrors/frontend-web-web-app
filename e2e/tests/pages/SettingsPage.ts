// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Page, Locator } from '@playwright/test';

export class SettingsPage {
  readonly page: Page;
  readonly settingsLink: Locator;
  readonly generalLink: Locator;
  readonly languageDropdown: Locator;
  readonly englishOption: Locator;
  readonly saveButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.settingsLink = page.getByRole('link', { name: /^(Einstellungen|Settings)$/ });
    this.generalLink = page.getByRole('link', { name: /^(Allgemein|General)$/ });
    this.languageDropdown = page.getByLabel(/^(Deutsch|English)$/);
    this.englishOption = page.getByRole('option', { name: 'English' });
    this.saveButton = page.getByRole('button', { name: /^(Änderungen speichern|Save)$/ });
    this.successMessage = page.getByText('Your settings have been saved successfully.');
  }

  async switchToEnglish() {
    await this.settingsLink.click();
    await this.generalLink.click();
    await this.languageDropdown.click();
    await this.englishOption.click();

    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          response.request().url().includes('users/me') &&
          response.request().method() === 'PATCH' &&
          response.status() === 200
      ),
      this.saveButton.click(),
    ]);
    await this.successMessage.isVisible();
  }
}
