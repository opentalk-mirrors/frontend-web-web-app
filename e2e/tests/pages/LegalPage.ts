// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { BrowserContext, Locator, Page } from '@playwright/test';

import { navigateToExternalPage } from '../helper/externalPageHelper';
import { SidebarPage } from './SidebarPage';

export class LegalPage {
  private readonly context: BrowserContext;

  public readonly page: Page;
  public readonly title: Locator;
  public readonly imprintLink: Locator;
  public readonly dataProtectionLink: Locator;

  constructor({ page, context }: { page: Page; context: BrowserContext }) {
    this.page = page;
    this.context = context;
    this.title = this.page.getByRole('heading', { name: 'Legal' });
    this.imprintLink = this.page.getByRole('link', { name: 'Imprint' });
    this.dataProtectionLink = this.page.getByRole('link', { name: 'Data Protection' });
  }

  public async navigateToLegalPage(): Promise<void> {
    await this.page.goto(process.env.INSTANCE_URL, { waitUntil: 'load' });

    const sidebarPage = new SidebarPage({ page: this.page });
    await sidebarPage.legalButton.click();
  }

  public async navigateToImprintPage(): Promise<Page> {
    await this.imprintLink.click();
    return await navigateToExternalPage(this.context, 'Terms of Use for OpenTalk-as-a-Service | OpenTalk');
  }

  public async navigateToDataProtectionPage(): Promise<Page> {
    await this.dataProtectionLink.click();
    return await navigateToExternalPage(this.context, 'Data Protection Notice | OpenTalk');
  }
}
