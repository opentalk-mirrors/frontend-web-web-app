// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Page, Locator } from '@playwright/test';

export class SidebarPage {
  page: Page;
  homeButton: Locator;
  meetingsButton: Locator;
  helpButton: Locator;
  settingButton: Locator;
  legalButton: Locator;
  logoutButton: Locator;
  closeNavigationButton: Locator;

  constructor({ page }: { page: Page }) {
    this.page = page;
    this.homeButton = this.page.getByRole('link', { name: 'Home' });
    this.meetingsButton = this.page.getByRole('link', { name: 'Meetings' });
    this.helpButton = this.page.getByRole('link', { name: 'Help' });
    this.settingButton = this.page.getByRole('link', { name: 'Settings' });
    this.legalButton = this.page.getByRole('link', { name: 'Legal' });
    this.logoutButton = this.page.getByRole('button', { name: 'Logout' });
    this.closeNavigationButton = this.page.getByRole('button', { name: 'Close navigation' });
  }

  getProfileLocator(): Locator {
    // profile name always has this href link
    return this.page.locator('//a[@href="/dashboard/settings/profile"]');
  }
}
