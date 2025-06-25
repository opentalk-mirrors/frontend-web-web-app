// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test, expect } from '@playwright/test';

import { joinMeetingRoomAsGuest, startAdhocMeetingAsModerator } from '../../../helper/meetingHelpers';
import { closeWebkitPopUp } from '../../../helper/webkit';
import { HomePage } from '../../../pages/HomePage';
import { LobbyRoomPage } from '../../../pages/LobbyRoomPage';

test.describe('Meeting Room_Debriefing', () => {
  test.beforeEach(async ({ page, browserName }) => {
    const homePage = new HomePage({ page });
    await homePage.navigateToHomePage();

    if (browserName === 'webkit') {
      await closeWebkitPopUp({ page });
    }
  });

  test('TC_002_Meeting room_Debriefing_For moderator', async ({ context, page }) => {
    const { meetingRoomPage, guestLink } = await startAdhocMeetingAsModerator(page);
    const guestMeetingRoomPage = await joinMeetingRoomAsGuest(context, guestLink, 'guest');
    // TODO: Need to add pre-condition to join meeting as few invited participants, once invited user scenario is implemented
    await meetingRoomPage.page.bringToFront();

    await meetingRoomPage.startDebriefingModeratorTool();
    await meetingRoomPage.selectDebriefingOption(meetingRoomPage.debriefingOptions.forModeratorOption);
    await expect(meetingRoomPage.debriefingOptions.debriefingInitAlert).toBeVisible();
    await meetingRoomPage.selectModeratorToolHome();
    await meetingRoomPage.selectPeopleTab();
    expect(await meetingRoomPage.hasModerator()).toBe(true);
    await expect(meetingRoomPage.participantsAvatar.guestAvatar).not.toBeVisible();
    // TODO: Need to assert that the registered invited users are not in the meeting room, once invited user scenario is implemented

    await guestMeetingRoomPage.page.bringToFront();
    const lobbyRoomPage = new LobbyRoomPage({ page: guestMeetingRoomPage.page });
    await expect(lobbyRoomPage.openTalkLogo).toBeVisible();
    await expect(lobbyRoomPage.conferenceCloseAlerts.conferenceCloseAlertNotification).toBeVisible();
    // TODO: Need to assert that the registered invited users are in the lobby, once invited user scenario is implemented
  });
});
