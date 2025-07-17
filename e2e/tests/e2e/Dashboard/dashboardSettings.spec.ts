// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test, expect } from '@playwright/test';

import { closeWebkitPopUp } from '../../helper/webkit';
import { HomePage } from '../../pages/HomePage';
import { MyMeetingsPage } from '../../pages/MyMeetingsPage';
import { GeneralPage } from '../../pages/Settings/GeneralPage';
import { SettingsPage } from '../../pages/Settings/SettingsPage';
import { SidebarPage } from '../../pages/SidebarPage';

test.describe('Dashboard_Settings', () => {
  let sideBarPage: SidebarPage,
    settingsPage: SettingsPage,
    generalPage: GeneralPage,
    homePage: HomePage,
    myMeetingsPage: MyMeetingsPage;

  test.beforeEach(async ({ page, browserName }) => {
    sideBarPage = new SidebarPage({ page });
    settingsPage = await sideBarPage.navigateToSettingsPage();
    generalPage = new GeneralPage(settingsPage.page);

    if (browserName === 'webkit') {
      await closeWebkitPopUp({ page });
    }
  });

  test('TC_001_Dashboard_Settings_General', async () => {
    await expect(settingsPage.settingsHeading).toBeVisible();
    await expect(settingsPage.generalLink).toHaveText('General');
    expect(await settingsPage.isOptionSelected(settingsPage.generalLink)).toBeTruthy();
    await expect(settingsPage.profileLink).toBeVisible();
    await expect(settingsPage.accountLink).toBeVisible();
    await expect(settingsPage.storageLink).toBeVisible();

    await expect(generalPage.languageHeading).toHaveText('Language');
    await expect(generalPage.languageDropdownMenu.selectedField).toBeVisible();
    await expect(generalPage.saveButton).toHaveText('Save');

    await generalPage.openLanguageDropdown();
    await expect(generalPage.languageDropdownMenu.optionsDropdown).toBeVisible();
    await expect(generalPage.languageDropdownMenu.options.deutsch).toBeVisible();
    await expect(generalPage.languageDropdownMenu.options.english).toBeVisible();

    await generalPage.selectLanguage('deutsch');
    await expect(generalPage.languageDropdownMenu.optionsDropdown).not.toBeVisible();
    await expect(generalPage.languageDropdownMenu.selectedField).toHaveText('Deutsch');

    await generalPage.saveSelectedLanguage();
    await expect(generalPage.successMessage).toHaveText('Deine Einstellungen wurden erfolgreich gespeichert.');
    await expect(generalPage.languageHeading).toHaveText('Sprache');
    await expect(generalPage.saveButton).toHaveText('Änderungen speichern');

    homePage = await sideBarPage.navigateToHomePage();
    await expect(homePage.startNewMeetingButton).toHaveText('Meeting starten');
    await expect(homePage.favoriteMeetingsHeaderSelector).toHaveText('Meine Favoriten');

    myMeetingsPage = await sideBarPage.navigateToMyMeetingsPage();
    await expect(myMeetingsPage.myMeetingsHeading).toHaveText('Meine Meetings');
    await expect(myMeetingsPage.planNewLink).toHaveText('Meeting planen');

    settingsPage = await sideBarPage.navigateToSettingsPage();
    await expect(generalPage.languageHeading).toHaveText('Sprache');
    await expect(generalPage.languageDropdownMenu.selectedField).toBeVisible();
    await expect(generalPage.saveButton).toHaveText('Änderungen speichern');

    await expect(settingsPage.generalLink).toHaveText('Allgemein');
    expect(await settingsPage.isOptionSelected(settingsPage.generalLink)).toBeTruthy();
    await generalPage.openLanguageDropdown();
    await expect(generalPage.languageDropdownMenu.optionsDropdown).toBeVisible();
    await expect(generalPage.languageDropdownMenu.options.deutsch).toBeVisible();
    await expect(generalPage.languageDropdownMenu.options.english).toBeVisible();

    await generalPage.selectLanguage('english');
    await expect(generalPage.languageDropdownMenu.optionsDropdown).not.toBeVisible();
    await expect(generalPage.languageDropdownMenu.selectedField).toHaveText('English');

    await generalPage.saveSelectedLanguage();
    await expect(generalPage.successMessage).toHaveText('Your settings have been saved successfully.');
    await expect(generalPage.languageHeading).toHaveText('Language');
    await expect(generalPage.saveButton).toHaveText('Save');

    homePage = await sideBarPage.navigateToHomePage();
    await expect(homePage.startNewMeetingButton).toHaveText('Start new');
    await expect(homePage.favoriteMeetingsHeaderSelector).toHaveText('My favorite meetings');

    myMeetingsPage = await sideBarPage.navigateToMyMeetingsPage();
    await expect(myMeetingsPage.myMeetingsHeading).toHaveText('My Meetings');
    await expect(myMeetingsPage.planNewLink).toHaveText('Plan new');
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
