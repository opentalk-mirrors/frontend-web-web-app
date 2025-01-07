// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.describe('Sidebar Navigation/Options', () => {
    test('verify the contents displayed in the settings option of dashboard', async ({ page }) => {
      await page.goto(process.env.INSTANCE_URL);
      await page.getByRole('link', { name: 'Settings', exact: true }).click();
      await expect(page.getByTestId('SecondaryNavigation').getByRole('list')).toContainText('General');
      await expect(page.getByTestId('SecondaryNavigation').getByRole('list')).toContainText('Profile');
      await expect(page.getByTestId('SecondaryNavigation').getByRole('list')).toContainText('Account');
    });

    test.skip('verify the contents displayed in the meetings option of dashboard', async ({ page }) => {
      await page.goto(process.env.INSTANCE_URL);
      await page.getByRole('link', { name: 'Meetings' }).click();
      await expect(page.getByLabel('Only show invites')).toBeVisible();
      await expect(page.getByTestId('favoriteMeeting')).toBeVisible();
      await expect(page.getByLabel('Month')).toBeVisible();
      await expect(page.getByLabel('Week')).toBeVisible();
      await expect(page.getByLabel('Day')).toBeVisible();
      await expect(page.getByRole('link', { name: 'Plan new meeting' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'My Meetings' })).toBeVisible();
    });

    test('verify the contents displayed in the home option of dashboard', async ({ page }) => {
      await page.goto(`${process.env.INSTANCE_URL}/dashboard/meetings`);
      await page.getByRole('link', { name: 'Home' }).click();
      await expect(page.getByRole('link', { name: 'Start new' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Plan new' })).toBeVisible();
      await expect(page.getByText('Current meetings')).toBeVisible();
      await expect(page.getByText('My favorite meetings')).toBeVisible();
    });

    test.skip('logout from dashboard will redirect to signIn page', async ({ page }) => {
      await page.goto(`${process.env.INSTANCE_URL}/dashboard`);
      await page.locator('button').filter({ hasText: 'Logout' }).click();
      await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
      //Relogin user again
      await page.goto(process.env.INSTANCE_URL);
      await page.getByLabel('Username or email').fill(process.env.USERNAME);
      await page.getByLabel('Username or email').press('Tab');
      await page.getByLabel('Password').fill(process.env.PASSWORD);
      await page.getByRole('button', { name: 'Sign In' }).click();
      await expect(page.getByRole('link', { name: /(Start|Starten)$/ }).nth(1)).toBeVisible();
    });
  });
});
