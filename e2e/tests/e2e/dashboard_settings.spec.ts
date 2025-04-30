// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test, expect } from '@playwright/test';

import { HomePage } from '../pages/HomePage';

test.describe('79_Dashboard_Settings', () => {
  test('TC_001_Dashboard_Settings_General', async ({ page }) => {
    const homePage = new HomePage({ page });
    await homePage.navigateToHomePage();
    await page.getByRole('link', { name: 'Settings' }).click();
    await expect(page.getByRole('heading', { name: 'Settings', exact: true })).toBeVisible();

    //details/options should be available in the Settings option
    await expect(page.getByRole('link', { name: 'General' })).toHaveClass(/active/);
    await expect(page.getByRole('link', { name: 'Profile' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Account', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Storage', exact: true })).toBeVisible();

    //details/options should be available in the General option of Settings
    await expect(page.getByRole('heading', { name: 'Language' })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'English' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();

    //The language dropdown menu should be opened and all options e shown
    await page.getByRole('combobox', { name: 'English' }).click();
    await expect(page.getByRole('option', { name: 'English' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Deutsch' })).toBeVisible();

    //switch language to german
    await page.getByRole('option', { name: 'Deutsch' }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Deine Einstellungen wurden erfolgreich gespeichert.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Sprache' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Änderungen speichern' })).toBeVisible();

    //switch language to english
    await page.getByRole('combobox', { name: 'Deutsch' }).click();
    await page.getByRole('option', { name: 'English' }).click();
    await page.getByRole('button', { name: 'Änderungen speichern' }).click();
    await expect(page.getByText('Your settings have been saved successfully.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Language' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
  });

  test.skip('TC_002_Dashboard_Settings_Profile option', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit');

    const homePage = new HomePage({ page });
    await homePage.navigateToHomePage();
    await page.getByRole('link', { name: 'Settings', exact: true }).click();
    await page.getByRole('link', { name: 'Profile' }).click();
    await expect(page.getByRole('heading', { name: 'Profile Picture' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Profile Name' }).isVisible();
    const profileName = await page.getByRole('textbox', { name: 'Profile Name' }).inputValue();
    await expect(page.getByRole('main').getByRole('img', { name: profileName })).toBeVisible();
    await expect(page.getByLabel('Profile Name')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Profile Name' })).toHaveValue(profileName);
    await expect(
      page.getByText(
        'Enter a name (such as your first name, full name, or a nickname) that will be visible to others on OpenTalk.'
      )
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Profile Name' })).toBeEditable();

    await page.getByRole('textbox', { name: 'Profile Name' }).clear();
    await expect(page.getByPlaceholder('John Doe')).toBeVisible();
    await expect(page.getByText('Error: "Profile Name" is a required field')).toBeVisible();

    await page.getByRole('textbox', { name: 'Profile Name' }).fill(`${profileName}-TEST`);
    await expect(page.getByRole('textbox', { name: 'Profile Name' })).toHaveValue(`${profileName}-TEST`);

    await page.getByRole('button', { name: 'Save' }).click();
    const alertMessage = await page.getByRole('alert').filter({ hasText: 'Your settings' });
    await expect(alertMessage).toBeVisible();
    await expect(page.getByText('Your settings have been saved successfully.')).toBeVisible();
    await expect(page.getByRole('navigation').getByText(`${profileName}-TEST`)).toBeVisible();

    //reset values
    await page.getByRole('textbox', { name: 'Profile Name' }).fill(process.env.USERNAME);
    await expect(page.getByRole('textbox', { name: 'Profile Name' })).toHaveValue(process.env.USERNAME);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByRole('navigation').getByText(process.env.USERNAME)).toBeVisible();
  });

  test('TC_003_Dashboard_Settings_Account option', async ({ page }) => {
    //verify the options/details available in Account option of Settings option in Dashboard
    const homePage = new HomePage({ page });
    await homePage.navigateToHomePage();
    await page.getByRole('link', { name: 'Settings', exact: true }).click();
    await page.getByRole('link', { name: 'Account', exact: true }).click();

    const emailField = page.getByLabel('E-Mail Address');
    const firstNameField = page.getByLabel('First Name');
    const familyNameField = page.getByLabel('Family Name');

    await expect(emailField).toHaveValue(process.env.USER_EMAIL);
    await expect(emailField).toHaveAttribute('readonly', '');
    await expect(firstNameField).toHaveAttribute('readonly', '');
    await expect(familyNameField).toHaveAttribute('readonly', '');
  });

  test('TC_004_Dashboard_Settings_Storage option', async ({ page }) => {
    //verify the options/details available in Account option of Settings option in Dashboard
    const homePage = new HomePage({ page });
    await homePage.navigateToHomePage();
    await page.getByRole('link', { name: 'Settings', exact: true }).click();
    await page.getByRole('link', { name: 'Storage', exact: true }).click();

    await expect(page.getByRole('heading', { name: 'Storage', exact: true })).toBeVisible();
    await expect(page.getByText('used')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'My Files' })).toBeVisible();
    /*
    todo for everything else we need dummy meetings and data https://git.opentalk.dev/opentalk/qa/reports/-/issues/79?show=5053
    rest-api is needed to go on here https://git.opentalk.dev/opentalk/userstories/-/issues/15
     */
  });
});
