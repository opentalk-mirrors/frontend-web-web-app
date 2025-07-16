// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
// the popup that appears after clicking on more-options => invite guest
// in the meeting room
import { BrowserContext, Locator, Page } from '@playwright/test';

import { navigateToExternalPage } from '../../helper/externalPageHelper';

export class BurgerMenuPage {
  private readonly context: BrowserContext;
  private readonly page: Page;

  public readonly burgerMenuDropdown: Locator;
  public readonly accessibilityMenuItem: Locator;
  public readonly userManualMenuItem: Locator;
  public readonly keyboardShortcutsMenuItem: Locator;
  public readonly reportABugMenuItem: Locator;

  constructor(page: Page) {
    this.page = page;
    this.context = this.page.context();
    this.burgerMenuDropdown = this.page.getByRole('menu', { name: 'My meeting' });
    this.accessibilityMenuItem = this.page.getByRole('menuitem', { name: 'Accessibility Open in new tab' });
    this.userManualMenuItem = this.page.getByRole('menuitem', { name: 'User manual Open in new tab' });
    this.keyboardShortcutsMenuItem = this.page.getByRole('menuitem', { name: 'Keyboard Shortcuts' });
    this.reportABugMenuItem = this.page.getByRole('menuitem', { name: 'Report a bug' });
  }

  public async gotoAccessibilty(): Promise<Page> {
    await this.accessibilityMenuItem.click();
    return await navigateToExternalPage(this.context, 'Erklärung zur Barrierefreiheit | OpenTalk');
  }

  public async gotoUserManual(): Promise<Page> {
    await this.userManualMenuItem.click();
    return await navigateToExternalPage(this.context, 'User manual | OpenTalk');
  }

  public async openKeyboardShortcuts() {
    await this.keyboardShortcutsMenuItem.click();
  }

  public async openReportABug() {
    await this.reportABugMenuItem.click();
  }
}
