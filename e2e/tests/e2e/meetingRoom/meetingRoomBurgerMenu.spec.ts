// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import test, { expect } from '@playwright/test';

import { joinMeetingRoomAsGuest, startAdhocMeetingAsModerator } from '../../helper/meetingHelpers';
import { closeWebkitPopUp } from '../../helper/webkit';
import { HomePage } from '../../pages/HomePage';
import { TalkingStickPage } from '../../pages/MeetingRoom/ModeratorTools/TalkingStickPage';

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

  test('TC_002_Keyboard Shortcuts', async ({ page, context, browserName }) => {
    test.skip(browserName === 'webkit');

    const { meetingRoomPage, guestLink } = await startAdhocMeetingAsModerator(page);
    const guestMeetingRoomPage = await joinMeetingRoomAsGuest(context, guestLink, 'guest');
    await meetingRoomPage.page.bringToFront();

    await meetingRoomPage.clickOnBurgerMenu();
    await expect(meetingRoomPage.burgerMenuDropdown).toBeVisible();

    await meetingRoomPage.clickOnKeyboardShortcuts();
    await expect(meetingRoomPage.keyboardShortcuts.keyboardShortcutsPopup).toBeVisible();
    await expect(meetingRoomPage.keyboardShortcuts.checkbox).toBeChecked();
    await meetingRoomPage.closeKeyboardShortcutsPopup();
    await expect(meetingRoomPage.keyboardShortcuts.keyboardShortcutsPopup).not.toBeVisible();
    await meetingRoomPage.pressEscape(); // escaping burgermenu because it does not allow to locate elements

    expect(await meetingRoomPage.isAudioOn()).toBeFalsy();
    await meetingRoomPage.useKeyboardShortcut('m');
    expect(await meetingRoomPage.isAudioOn()).toBeTruthy();
    await meetingRoomPage.useKeyboardShortcut('m');
    expect(await meetingRoomPage.isAudioOn()).toBeFalsy();

    expect(await meetingRoomPage.isCameraOn()).toBeFalsy();
    await meetingRoomPage.useKeyboardShortcut('v');
    expect(await meetingRoomPage.isCameraOn()).toBeTruthy();
    await meetingRoomPage.useKeyboardShortcut('v');
    expect(await meetingRoomPage.isCameraOn()).toBeFalsy();

    expect(await meetingRoomPage.isFullScreen()).toBeFalsy();
    await meetingRoomPage.useKeyboardShortcut('f');
    expect(await meetingRoomPage.isFullScreen()).toBeTruthy();
    await meetingRoomPage.useKeyboardShortcut('f');
    expect(await meetingRoomPage.isFullScreen()).toBeFalsy();

    expect(await meetingRoomPage.isAudioOn()).toBeFalsy();
    await meetingRoomPage.holdToSpeak();
    expect(await meetingRoomPage.isAudioOn()).toBeTruthy();
    await meetingRoomPage.releaseHoldToSpeak();
    expect(await meetingRoomPage.isAudioOn()).toBeFalsy();

    const talkingStickPage = new TalkingStickPage({ page });
    await talkingStickPage.clickOnTalkingStick();
    await talkingStickPage.clickOnTalkingStickStartNow();
    await expect(talkingStickPage.talkingStickStartedNotification).toBeVisible();
    await expect(talkingStickPage.yourTurnPopup).toBeVisible();

    await meetingRoomPage.useKeyboardShortcut('n');
    await expect(talkingStickPage.yourTurnPopup).not.toBeVisible();
    await guestMeetingRoomPage.page.bringToFront();
    const guestTalkingStickPage = new TalkingStickPage({ page: guestMeetingRoomPage.page });
    await expect(guestTalkingStickPage.yourTurnPopup).toBeVisible();
    await guestMeetingRoomPage.useKeyboardShortcut('n');
    await meetingRoomPage.page.bringToFront();

    await meetingRoomPage.clickOnBurgerMenu();
    await meetingRoomPage.clickOnKeyboardShortcuts();
    await meetingRoomPage.deactivateKeyboardShortcuts();
    await expect(meetingRoomPage.keyboardShortcuts.checkbox).not.toBeChecked();
    await meetingRoomPage.pressEscape();
    await expect(meetingRoomPage.keyboardShortcuts.keyboardShortcutsPopup).not.toBeVisible();
    await meetingRoomPage.pressEscape();

    expect(await meetingRoomPage.isAudioOn()).toBeFalsy();
    await meetingRoomPage.useKeyboardShortcut('m');
    expect(await meetingRoomPage.isAudioOn()).toBeFalsy();

    expect(await meetingRoomPage.isCameraOn()).toBeFalsy();
    await meetingRoomPage.useKeyboardShortcut('v');
    expect(await meetingRoomPage.isCameraOn()).toBeFalsy();

    expect(await meetingRoomPage.isFullScreen()).toBeFalsy();
    await meetingRoomPage.useKeyboardShortcut('f');
    expect(await meetingRoomPage.isFullScreen()).toBeFalsy();

    await talkingStickPage.clickOnTalkingStickStartNow();
    await expect(talkingStickPage.yourTurnPopup).toBeVisible();
    await meetingRoomPage.useKeyboardShortcut('n');
    await expect(talkingStickPage.yourTurnPopup).toBeVisible();

    expect(await meetingRoomPage.isAudioOn()).toBeFalsy();
    await meetingRoomPage.holdToSpeak();
    expect(await meetingRoomPage.isAudioOn()).toBeFalsy();
  });

  test('TC_005_Report a Bug', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit');

    const closingMethods = ['BTN_esc', 'BTN_x', 'outside the window'];
    for (const method of closingMethods) {
      const { meetingRoomPage } = await startAdhocMeetingAsModerator(page);
      await meetingRoomPage.clickOnBurgerMenu();
      await expect(meetingRoomPage.burgerMenuDropdown).toBeVisible();

      await meetingRoomPage.clickOnReportABug();
      await expect(meetingRoomPage.reportABug.manualGlitchtipPopup).toBeVisible();

      await meetingRoomPage.closeManualGlitchtipPopup(method);
      await expect(meetingRoomPage.reportABug.manualGlitchtipPopup).not.toBeVisible();
    }
  });
});
