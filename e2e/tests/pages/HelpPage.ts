// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Page, Locator, BrowserContext } from '@playwright/test';

import { SidebarPage } from '../pages/SidebarPage';

export class HelpPage {
  page: Page;
  context: BrowserContext;
  userManualLink: Locator;
  supportLink: Locator;
  userManualHeading: Locator;
  helpHeading: Locator;

  constructor({ page, context }: { page: Page; context: BrowserContext }) {
    this.page = page;
    this.context = context;
    this.helpHeading = this.page.getByRole('heading', { name: 'Help' });
    this.userManualLink = this.page.getByRole('link', { name: 'User Manual' });
    this.supportLink = this.page.getByRole('link', { name: 'Support' });
    this.userManualHeading = this.page.getByRole('heading', { name: 'User manual' });
  }

  async navigateToHelpPage(): Promise<void> {
    await Promise.all([this.page.goto(process.env.INSTANCE_URL), this.page.waitForLoadState('load')]);

    const sidebarPage = new SidebarPage({ page: this.page });
    await sidebarPage.helpButton.click();
  }

  async navigateToUserManual(): Promise<Page> {
    await this.userManualLink.click();
    await new Promise((res) => setTimeout(res, 5_000));
    const allOpenPages = this.context.pages();

    for (const page of allOpenPages) {
      if ((await page.title()) === 'User manual | OpenTalk') {
        return page;
      }
    }
    return this.context.pages()[2];
  }

  async navigateToSupport(): Promise<Page> {
    await this.supportLink.click();
    await new Promise((res) => setTimeout(res, 5_000));
    const allOpenPages = this.context.pages();

    for (const page of allOpenPages) {
      if ((await page.title()) === 'Contact our support team | OpenTalk') {
        return page;
      }
    }
    return this.context.pages()[2];
  }
}
