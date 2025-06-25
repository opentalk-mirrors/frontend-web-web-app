// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { expect, test } from '@playwright/test';

import { getClipboardContent } from '../../helper/clipboardHelpers';
import { HomePage } from '../../pages/HomePage';
import { LobbyRoomPage } from '../../pages/LobbyRoomPage';

let homePage: HomePage;
const meetingTitle = 'Meeting room URL';

test.beforeEach('Navigate to dashboard', async ({ page }) => {
  homePage = new HomePage({ page });
  await homePage.navigateToHomePage();
  await homePage.deleteAllCreatedMeetings(meetingTitle);
});

test.describe('Meeting room URL', async () => {
  test('TC_001_URL route in Dashboard + Meeting Room', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit'); // Copying to clipboard does not work in webkit
    const instanceUrl = new URL(process.env.INSTANCE_URL);

    const UUIDRegexString = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
    const meetingLinkRegex = new RegExp(instanceUrl.host + '/room/' + UUIDRegexString + '$');
    const guestLinkRegex = new RegExp(
      instanceUrl.host + '/room/' + UUIDRegexString + '\\?invite=' + UUIDRegexString + '$'
    );
    const meetingPlanningPage = await homePage.planNewMeeting();
    await meetingPlanningPage.createNewMeeting(meetingTitle);
    await homePage.navigateToHomePage();
    const meetingDetailsPage = await homePage.showMeetingDetails(meetingTitle);
    const meetingLink = await meetingDetailsPage.getMeetingLink();
    expect(meetingLink).toMatch(meetingLinkRegex);
    let guestLink = await meetingDetailsPage.getGuestLink();
    expect(guestLink).toMatch(guestLinkRegex);

    await meetingDetailsPage.copyMeetingLinkToClipboard();
    expect(await getClipboardContent(page)).toEqual(meetingLink);
    await meetingDetailsPage.copyGuestLinkToClipboard();
    expect(await getClipboardContent(page)).toEqual(guestLink);

    await page.goto(meetingLink);
    const lobbyRoomPage = new LobbyRoomPage({ page });
    const meetingRoomPage = await lobbyRoomPage.enterMeetingRoom();
    expect(await meetingRoomPage.getMeetingRoomName()).toEqual(meetingTitle);

    const moreOptionsPage = await meetingRoomPage.showMoreOptions();
    const inviteGuestPopupPage = await moreOptionsPage.inviteGuest();
    await inviteGuestPopupPage.createInvitation();
    guestLink = await inviteGuestPopupPage.getGuestLink();
    expect(guestLink).toMatch(guestLinkRegex);

    await inviteGuestPopupPage.copyToClipboard();
    expect(await getClipboardContent(page)).toEqual(guestLink);
  });
});
