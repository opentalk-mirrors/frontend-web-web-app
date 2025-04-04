// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  page: Page;
  signInButton: Locator;
  usernameInputField: Locator;
  passwordInputField: Locator;

  constructor(page: Page) {
    this.page = page;
    this.signInButton = page.getByRole('button', { name: /^(Anmelden|Sign In)$/ });
    this.usernameInputField = page.getByRole('textbox', { name: 'Username or email' });
    this.passwordInputField = page.getByRole('textbox', { name: 'Password' });
  }

  async gotoLoginPage() {
    await this.page.goto(process.env.INSTANCE_URL);
  }

  async login(username: string, password: string) {
    await this.signInButton.isVisible();
    await this.usernameInputField.fill(username);
    await this.usernameInputField.press('Tab');
    await this.passwordInputField.fill(password);

    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          response.url().endsWith('/token') && response.status() === 200 && response.request().method() === 'POST'
      ),
      this.signInButton.click(),
    ]);
  }
}
