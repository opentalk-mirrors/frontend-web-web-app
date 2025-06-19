// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test, expect } from '@playwright/test';

import { getClipboardContent } from '../../helper/clipboardHelpers';
import { planNewMeetingAndStartAsModerator } from '../../helper/meetingHelpers';
import { HomePage } from '../../pages/HomePage';

const meetingTitle = 'Smoke test all';
const meetingPassword = 'test@123';
const userName = process.env.USERNAME;

test.afterEach(async ({ page }) => {
  const homePage = new HomePage({ page });
  await homePage.navigateToHomePage();
  await homePage.deleteMeeting(meetingTitle);
});

test.describe('Meeting Room_Meeting credentials for all in conference', () => {
  test('TC_001_MeetingRoom_Meeting credentials summary', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit');

    const { meetingRoomPage, guestLink, phoneDialIn, telephoneDialInNumber, conferenceId, conferencePin } =
      await planNewMeetingAndStartAsModerator(page, meetingTitle, meetingPassword);
    await expect(meetingRoomPage.meetingDetails.infoButton).toBeVisible();

    await meetingRoomPage.showMeetingDetails();
    await expect(meetingRoomPage.meetingDetails.inviteLinkInputField).toBeVisible();
    await expect(meetingRoomPage.meetingDetails.dialInNumberInputField).toBeVisible();
    await expect(meetingRoomPage.meetingDetails.shareOptions.clipBoardButton).toBeVisible();
    await expect(meetingRoomPage.meetingDetails.shareOptions.eMailButton).toBeVisible();
    await expect(meetingRoomPage.meetingDetails.passwordInputField).toBeVisible();

    await meetingRoomPage.copyMeetingDetailsToClipboard();
    await expect(meetingRoomPage.meetingDetails.alertPopup.detailsCopiedToClipboardPopup).toBeVisible();

    const clipboardContent = await getClipboardContent(page);
    expect(clipboardContent).toContain(`${userName} invites you to an OpenTalk meeting.`);
    expect(clipboardContent).toContain(`Title: ${meetingTitle}`);
    expect(clipboardContent).toContain('You can join the meeting using one of the following means:');
    expect(clipboardContent).toContain(`Meeting-Link: ${guestLink}`);
    expect(clipboardContent).toContain(`Password: ${meetingPassword}`);
    expect(clipboardContent).toContain(`Telephone dial-in\nNumber: ${telephoneDialInNumber}`);
    expect(clipboardContent).toContain(`Conference-ID: ${conferenceId}`);
    expect(clipboardContent).toContain(`Conference-PIN: ${conferencePin}`);

    // skipped click on E-mail test step as depending on testing environment, it opens in a different email app,
    // so this needs to be tested manually until a solution has been found

    await meetingRoomPage.copyInviteLinkToClipboard();
    await expect(meetingRoomPage.meetingDetails.alertPopup.linkCopiedToClipboardPopup).toBeVisible();
    expect(await getClipboardContent(page)).toContain(guestLink);

    await meetingRoomPage.copyDialInNumberToClipboard();
    await expect(meetingRoomPage.meetingDetails.alertPopup.dialInCopiedToClipboardPopup).toBeVisible();
    expect(await getClipboardContent(page)).toContain(phoneDialIn);

    await meetingRoomPage.copyPasswordToClipboard();
    await expect(meetingRoomPage.meetingDetails.alertPopup.passwordCopiedToClipboardPopup).toBeVisible();
    expect(await getClipboardContent(page)).toContain(meetingPassword);
  });
});
