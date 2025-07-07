// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test as setup } from '@playwright/test';

import { changeLanguage, validateUserJson } from './helper/Api';
import { LoginPage } from './pages/LoginPage';

export const authUserFile = '.auth/user.json';

setup('authenticate and set english language', async ({ page }) => {
  // Perform authentication steps.
  const loginPage = new LoginPage(page);
  await loginPage.gotoLoginPage();
  await loginPage.login(process.env.USERNAME, process.env.PASSWORD);

  // End of authentication steps.
  await page.context().storageState({ path: authUserFile });
  validateUserJson(authUserFile);

  // Set language to english
  await changeLanguage('en-US');
});
