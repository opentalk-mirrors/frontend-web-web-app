// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test, expect } from '@playwright/test';

test.describe('79_Dashboard_Settings', () => {
  test('TC_001_Dashboard_Settings_Navigation', async ({ page }) => {
    //check if the navigation to Settings is correct in the Dashboard
    await page.goto(`${process.env.INSTANCE_URL}/dashboard`);
    await page.getByRole('link', { name: 'Settings' }).click();
    await expect(page.getByRole('heading', { name: 'Settings', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'General' })).toHaveClass(/active/);
    await expect(page.getByRole('link', { name: 'Profile' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Account', exact: true })).toBeVisible();
  });
  test('TC_002_Dashboard_Settings_General option', async ({ page }) => {
    //verify the options/details available in General option of Settings option in Dashboard
    await page.goto(`${process.env.INSTANCE_URL}/dashboard`);
    await page.getByRole('link', { name: 'Settings', exact: true }).click();
    await expect(page.getByRole('link', { name: 'General' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Language' })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'English' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
  });
  test('TC_003_Dashboard_Settings_General_Language Dropdown menu', async ({ page }) => {
    //switch language in dashboard to german and english
    await page.goto(`${process.env.INSTANCE_URL}/dashboard`);
    await page.getByRole('link', { name: 'Settings', exact: true }).click();
    await page.getByRole('combobox', { name: 'English' }).click();
    await page.getByRole('option', { name: 'Deutsch' }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    //TODO: activate this check after issue #1733 was solved
    //await expect(page.getByText('Deine Einstellungen wurden erfolgreich gespeichert')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Sprache' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Help' })).not.toBeVisible();
    await expect(page.getByRole('link', { name: 'Hilfe' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'General' })).not.toBeVisible();
    await expect(page.getByRole('link', { name: 'Allgemein' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Änderungen speichern' })).toBeVisible();
    await page.getByRole('combobox', { name: 'Deutsch' }).click();
    await page.getByRole('option', { name: 'English' }).click();
    await page.getByRole('button', { name: 'Änderungen speichern' }).click();
    //TODO: activate this check after issue #1733 was solved
    //await expect(page.getByText('Your settings have been saved successfully.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Language' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Help' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Hilfe' })).not.toBeVisible();
    await expect(page.getByRole('link', { name: 'General' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Allgemein' })).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
  });
  test('TC_004_Dashboard_Settings_Profile option', async ({ page }) => {
    //verify the options/details available in Profile option of Settings option in Dashboard
    await page.goto(`${process.env.INSTANCE_URL}/dashboard`);
    await page.getByRole('link', { name: 'Settings', exact: true }).click();
    await page.getByRole('link', { name: 'Profile' }).click();
    const profileName = await page.locator('input').inputValue();
    await expect(page.getByRole('heading', { name: 'Profile Picture' })).toBeVisible();
    await expect(page.getByRole('main').getByRole('img', { name: profileName })).toBeVisible();
    await expect(page.getByLabel('Profile Name')).toBeVisible();
    await expect(page.locator('input')).toHaveAttribute('name', 'displayName');
    await expect(
      page.getByText(
        'Enter a name (such as your first name, full name, or a nickname) that will be visible to others on OpenTalk.'
      )
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
  });
  test('TC_005_Dashboard_Settings_Profile_Profile Name', async ({ page }) => {
    //verify the field level functionality of Profile Name input field available in Profile option of Settings option in Dashboard
    const profileName = 'Mario';
    await page.goto(`${process.env.INSTANCE_URL}/dashboard`);
    await page.getByRole('link', { name: 'Settings', exact: true }).click();
    await page.getByRole('link', { name: 'Profile' }).click();
    await page.locator('input').fill('');
    await expect(page.getByText('Error: "Profile Name" is a required field')).toBeVisible();
    await page.locator('input').fill(profileName);
    await expect(page.locator('input')).toHaveValue(profileName);
  });
  test('TC_006_Dashboard_Settings_Profile_Save button', async ({ page }) => {
    //verify the field level functionality of Save button available in Profile option of Settings option in Dashboard
    const profileName = 'Luigi';
    await page.goto(`${process.env.INSTANCE_URL}/dashboard`);
    await page.getByRole('link', { name: 'Settings', exact: true }).click();
    await page.getByRole('link', { name: 'Profile' }).click();
    const inputField = page.locator('input');
    const oldProfileName = await page.locator('input').inputValue();
    await inputField.fill(profileName);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Your settings have been saved')).toBeVisible();
    await expect(inputField).toHaveValue(profileName);
    await inputField.fill(oldProfileName);
    await page.getByRole('button', { name: 'Save' }).click();
  });
  test('TC_007_Dashboard_Settings_Account option', async ({ page }) => {
    //verify the options/details available in Account option of Settings option in Dashboard
    await page.goto(`${process.env.INSTANCE_URL}/dashboard`);
    await page.getByRole('link', { name: 'Settings', exact: true }).click();
    await page.getByRole('link', { name: 'Account', exact: true }).click();

    const emailField = page.getByLabel('E-Mail Address');
    const firstNameField = page.getByLabel('First Name');
    const familyNameField = page.getByLabel('Family Name');

    await expect(emailField).toHaveValue(process.env.USER_EMAIL);
    await emailField.click({ force: true }); // force: true prevents playwright from waiting for the field to be focused
    await expect(emailField).not.toBeFocused();

    await expect(firstNameField).toBeVisible();
    await firstNameField.click({ force: true });
    await expect(firstNameField).not.toBeFocused();

    await expect(familyNameField).toBeVisible();
    await familyNameField.click({ force: true });
    await expect(familyNameField).not.toBeFocused();
  });
});
