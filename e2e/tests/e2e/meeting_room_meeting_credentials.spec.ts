// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test, expect } from '@playwright/test';

const meetingName = 'Test Meeting';
const meetingPassword = 'test1234';

test.describe.skip('Meeting Room_Meeting credentials', () => {
  test.afterAll(async ({ page }) => {
    //cleanup
    await page.goto(`${process.env.INSTANCE_URL}/dashboard`);
    await page
      .getByRole('listitem')
      .filter({ hasText: meetingName })
      .getByRole('button', { name: 'More Options' })
      .click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'Delete' }).click();
  });

  test('TC_001_MeetingRoom_Meeting credentials summary', async ({ page, browserName, context }) => {
    await page.goto(`${process.env.INSTANCE_URL}/dashboard`);
    if (browserName === 'webkit') {
      await page.getByRole('button', { name: 'Ok' }).click();
    }
    await page.getByRole('link', { name: 'Plan new' }).click();
    await page.getByPlaceholder('My new Meeting').click();
    await page.getByPlaceholder('My new Meeting').fill(meetingName);

    await expect(page.getByLabel('Meeting details visible /')).toBeVisible();

    await page.getByPlaceholder('Strong password has at least').click();
    await page.getByPlaceholder('Strong password has at least').fill(meetingPassword);
    await page.getByRole('button', { name: 'Save' }).click();
    const meetingLink = await page.getByLabel('Meeting-Link').inputValue();

    const page2 = await context.newPage();
    await page2.goto(meetingLink);

    await expect(page2.getByRole('textbox', { name: 'Name' })).toBeVisible();
    await page2.getByRole('button', { name: 'Enter now' }).click();

    await expect(page2.getByLabel('Share meeting details')).toBeVisible();

    await page2.getByLabel('Share meeting details').click();
    await page2.getByRole('button', { name: 'Clipboard' }).click();

    await expect(page2.getByText('Details were copied to your')).toBeVisible();

    // skipped in case of this issue https://github.com/microsoft/playwright/issues/34307
    if (browserName !== 'webkit') {
      const clipboardContent = await page2.evaluate(() => navigator.clipboard.readText());
      const regexName = new RegExp(`\\b${meetingName}\\b`);
      const regexPassword = new RegExp(`\\b${meetingPassword}\\b`);
      const nameExist = clipboardContent.search(regexName) !== -1;
      const passwordExist = clipboardContent.search(regexPassword) !== -1;

      expect(nameExist).toBeTruthy();
      expect(passwordExist).toBeTruthy();

      await page2.getByLabel('Copy Invite Link').click();
      await expect(page2.getByText('The link was copied to your')).toBeVisible();
      const valueFromInviteInput = await page2.getByRole('textbox', { name: 'Invite Link' }).inputValue();
      const clipboardInviteContent = await page2.evaluate(() => navigator.clipboard.readText());
      expect(clipboardInviteContent).toMatch(valueFromInviteInput);

      await page2.getByLabel('Copy Password').click();
      await expect(page2.getByText('The password was copied to')).toBeVisible();
      const valueFromPasswordInput = await page2.getByRole('textbox', { name: 'Password' }).inputValue();
      const clipboardPasswordContent = await page2.evaluate(() => navigator.clipboard.readText());
      expect(clipboardPasswordContent).toMatch(valueFromPasswordInput);
    }
  });
});
