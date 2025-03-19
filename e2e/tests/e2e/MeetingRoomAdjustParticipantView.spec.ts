// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test, expect } from '@playwright/test';

import { HomePage } from '../pages/HomePage';
import { LobbyRoomPage } from '../pages/LobbyRoomPage';
import { MeetingPage } from '../pages/MeetingPage';
import { MeetingRoomPage } from '../pages/MeetingRoomPage';

test.describe('MeetingRoom - adjust participant view', () => {
  test('TC_001_VideoRoom_ParticipantViewSettings_List', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit');

    // launch OpenTalk
    await page.goto(process.env.INSTANCE_URL);

    // start new (adhoc) meeting
    const homePage = new HomePage({ page });
    await homePage.startNewMeetingButton.click();

    const meetingPage = new MeetingPage({ page });
    await meetingPage.goToAdhocMeetingLobby();

    const lobbyRoomPage = new LobbyRoomPage({ page });
    // from meeting-room-timer.spec.ts
    // "We need to wait for the username to appear here because otherwise the tests will be flaky (see issue #1692)"
    await expect(lobbyRoomPage.nameInputField).toBeVisible();

    // enter meeting room
    await lobbyRoomPage.joinMeetingButton.click();
    const meetingRoomPage = new MeetingRoomPage({ page });

    // assert meeting room is shown
    await expect(meetingRoomPage.meetingRoomName).toBeVisible();
    await expect(await meetingRoomPage.getMeetingRoomName()).toContain('Ad-hoc Meeting');

    // work around for differences between test server and local setup
    meetingRoomPage.allocateViewOptionLocatorsBasedOnSetup();

    // when opening grid view options besides the meeting room name
    await meetingRoomPage.viewOptions.viewOptionsButton.waitFor();
    await meetingRoomPage.viewOptions.viewOptionsButton.click();
    await meetingRoomPage.viewOptions.viewAndSortingPopupMenu.waitFor();
    await expect(meetingRoomPage.viewOptions.viewAndSortingPopupMenu).toBeVisible();

    // assert grid view shows up with 3 options: Grid-View, Speaker-View, Fullscreen
    await expect(meetingRoomPage.viewOptions.gridViewOption).toBeVisible();
    await expect(await meetingRoomPage.viewOptions.gridViewOption.innerText()).toBe('Grid-View');
    await expect(meetingRoomPage.viewOptions.speakerViewOption).toBeVisible();
    await expect(await meetingRoomPage.viewOptions.speakerViewOption.innerText()).toBe('Speaker-View');
    await expect(meetingRoomPage.viewOptions.fullScreenViewOption).toBeVisible();
    await expect(await meetingRoomPage.viewOptions.fullScreenViewOption.innerText()).toBe('Fullscreen');
    // assert sorting shows up with 2 options: Activated camera first, Moderator(s) first
    await expect(meetingRoomPage.viewOptions.activatedCameraFirstSortingOption).toBeVisible();
    await expect(await meetingRoomPage.viewOptions.activatedCameraFirstSortingOption.innerText()).toBe(
      'Activated camera first'
    );
    await expect(meetingRoomPage.viewOptions.moderatorsFirstSortingOption).toBeVisible();
    await expect(await meetingRoomPage.viewOptions.moderatorsFirstSortingOption.innerText()).toBe('Moderator(s) first');
  });
});
