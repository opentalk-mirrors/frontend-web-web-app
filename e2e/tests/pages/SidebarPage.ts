// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Page, Locator } from '@playwright/test';

import { HomePage } from './HomePage';
import { MyMeetingsPage } from './MyMeetingsPage';
import { SettingsPage } from './Settings/SettingsPage';

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
    this.homeButton = this.page.getByRole('link', { name: /^(Home|Startseite)$/ });
    this.meetingsButton = this.page.getByRole('link', { name: 'Meetings' });
    this.helpButton = this.page.getByRole('link', { name: 'Help' });
    this.settingButton = this.page.getByRole('link', { name: /^(Settings|Einstellungen)$/ });
    this.legalButton = this.page.getByRole('link', { name: 'Legal' });
    this.logoutButton = this.page.getByRole('button', { name: 'Logout' });
    this.closeNavigationButton = this.page.getByRole('button', { name: 'Close navigation' });
  }

  getProfileLocator(): Locator {
    // profile name always has this href link
    return this.page.locator('//a[@href="/dashboard/settings/profile"]');
  }

  public async navigateToSettingsPage(): Promise<SettingsPage> {
    await this.page.goto(process.env.INSTANCE_URL, { waitUntil: 'load' });
    await this.settingButton.click();
    const settingsPage = new SettingsPage(this.page);
    await settingsPage.settingsHeading.waitFor();
    return settingsPage;
  }

  public async navigateToHomePage(): Promise<HomePage> {
    await this.page.goto(process.env.INSTANCE_URL, { waitUntil: 'load' });
    await this.homeButton.click();
    const homePage = new HomePage({ page: this.page });
    return homePage;
  }

  public async navigateToMyMeetingsPage(): Promise<MyMeetingsPage> {
    await this.page.goto(process.env.INSTANCE_URL, { waitUntil: 'load' });
    await this.meetingsButton.click();
    const myMeetingsPage = new MyMeetingsPage(this.page);
    return myMeetingsPage;
  }
}
