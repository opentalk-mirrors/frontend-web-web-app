// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import test, { expect } from '@playwright/test';

import { startAdhocMeetingAsModerator } from '../helper/meetingHelpers';
import { closeWebkitPopUp } from '../helper/webkit';
import { HomePage } from '../pages/HomePage';

test.beforeEach(async ({ page, browserName }) => {
  const homePage = new HomePage({ page });
  await homePage.navigateToHomePage();
  if (browserName === 'webkit') {
    await closeWebkitPopUp({ page });
  }
});

test.describe('Meeting Room_Burger menu', () => {
  test('TC_001_User manual', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit');

    const { meetingRoomPage } = await startAdhocMeetingAsModerator(page);
    await meetingRoomPage.clickOnBurgerMenu();
    await expect(meetingRoomPage.burgerMenuList.accessibilityMenuItem).toBeVisible();
    await expect(meetingRoomPage.burgerMenuList.userManualMenuItem).toBeVisible();
    await expect(meetingRoomPage.burgerMenuList.keyboardShortcutsMenuItem).toBeVisible();
    await expect(meetingRoomPage.burgerMenuList.reportABugMenuItem).toBeVisible();

    const userManualPage = await meetingRoomPage.gotoUserManual();
    const userManualHeading = userManualPage.getByRole('heading', { name: 'User manual', exact: true });
    const openTalkDocs = userManualPage.getByText(
      'Please contact your admin if this manual leaves any questions unanswered or if you have found a technical error. We hope you enjoy using OpenTalk!',
      { exact: true }
    );
    expect(userManualPage.url()).toBe('https://docs.opentalk.eu/user/Handbuch/');
    await expect(userManualHeading).toBeVisible();
    await expect(openTalkDocs).toBeVisible();

    await meetingRoomPage.page.bringToFront();
    await expect(meetingRoomPage.meetingRoomName).toBeVisible();
  });
});
