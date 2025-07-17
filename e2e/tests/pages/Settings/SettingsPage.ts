// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Page, Locator } from '@playwright/test';

export class SettingsPage {
  public readonly page: Page;
  public readonly settingsLink: Locator;
  public readonly settingsHeading: Locator;
  public readonly generalLink: Locator;
  public readonly profileLink: Locator;
  public readonly accountLink: Locator;
  public readonly storageLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.settingsLink = this.page.getByRole('link', { name: /^(Einstellungen|Settings)$/ });
    this.settingsHeading = this.page.getByRole('heading', { name: /^(Einstellungen|Settings)$/, exact: true });
    this.generalLink = this.page.getByRole('link', { name: /^(Allgemein|General)$/ });
    this.profileLink = this.page.getByRole('link', { name: 'Profile' });
    this.accountLink = this.page.getByRole('link', { name: 'Account' });
    this.storageLink = this.page.getByRole('link', { name: 'Storage' });
  }

  public async isOptionSelected(locator: Locator): Promise<boolean> {
    await locator.waitFor();
    return await locator.evaluate((el) => el.classList.contains('active'));
  }
}
