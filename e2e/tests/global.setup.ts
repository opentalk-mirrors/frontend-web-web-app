// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test as setup, expect } from '@playwright/test';

export const authUserFile = '.auth/user.json';

setup('authenticate and set english language', async ({ page }) => {
  // Perform authentication steps.
  await page.goto(process.env.INSTANCE_URL);
  await page.getByRole('button', { name: /^(Anmelden|Sign In)$/ }).isVisible();
  await page.getByRole('textbox', { name: 'Username or email' }).fill(process.env.USERNAME);
  await page.getByRole('textbox', { name: 'Username or email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill(process.env.PASSWORD);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByRole('link', { name: /(Home|Startseite)$/ })).toBeVisible();

  // End of authentication steps.
  await page.context().storageState({ path: authUserFile });

  // Set language to english
  await page.getByRole('link', { name: /^(Einstellungen|Settings)$/ }).click();
  await page.getByRole('link', { name: /^(Allgemein|General)$/ }).click();
  await page.getByLabel(/^(Deutsch|English)$/).click();
  await page.getByRole('option', { name: 'English' }).click();
  await page.getByRole('button', { name: /^(Änderungen speichern|Save)$/ }).click();
  await expect(page.getByText('Your settings have been saved successfully.')).toBeVisible();
});
