// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test, expect } from '@playwright/test';

import { joinMeetingRoomAsGuest, startAdhocMeetingAsModerator } from '../../../helper/meetingHelpers';
import { closeWebkitPopUp } from '../../../helper/webkit';
import { HomePage } from '../../../pages/HomePage';
import { LobbyRoomPage } from '../../../pages/LobbyRoomPage';
import { MeetingRoomPage } from '../../../pages/MeetingRoom/MeetingRoomPage';

test.describe('Meeting Room_Debriefing', () => {
  let meetingRoomPage: MeetingRoomPage, guestLink: string, guestMeetingRoomPage: MeetingRoomPage;

  test.beforeEach(async ({ page, context, browserName }) => {
    const homePage = new HomePage({ page });
    await homePage.navigateToHomePage();

    ({ meetingRoomPage, guestLink } = await startAdhocMeetingAsModerator(page));
    guestMeetingRoomPage = await joinMeetingRoomAsGuest(context, guestLink, 'guest');
    // TODO: Need to add pre-condition to join meeting as few invited participants, once invited user scenario is implemented
    await meetingRoomPage.page.bringToFront();

    if (browserName === 'webkit') {
      await closeWebkitPopUp({ page });
    }
  });

  test('TC_001_Meeting room_Debriefing_For moderator + registered user', async () => {
    await meetingRoomPage.startDebriefingModeratorTool();
    await expect(meetingRoomPage.debriefingOptions.endOfTheConferenceOption).toBeVisible();
    await expect(meetingRoomPage.debriefingOptions.forModeratorOption).toBeVisible();
    await expect(meetingRoomPage.debriefingOptions.forModeratorAndRegisteredUserOption).toBeVisible();

    await meetingRoomPage.selectDebriefingOption(meetingRoomPage.debriefingOptions.forModeratorAndRegisteredUserOption);
    await expect(meetingRoomPage.debriefingOptions.debriefingInitAlert).toBeVisible();
    await meetingRoomPage.selectModeratorToolHome();
    await meetingRoomPage.selectPeopleTab();
    expect(await meetingRoomPage.hasModerator()).toBe(true);
    await expect(meetingRoomPage.participantsAvatar.guestAvatar).not.toBeVisible();
    // TODO: Need to assert that the registered invited users are in the meeting room, once invited user scenario is implemented

    await guestMeetingRoomPage.page.bringToFront();
    const lobbyRoomPage = new LobbyRoomPage({ page: guestMeetingRoomPage.page });
    await expect(lobbyRoomPage.openTalkLogo).toBeVisible();
    await expect(lobbyRoomPage.conferenceCloseAlerts.conferenceCloseAlertNotification).toBeVisible();
  });

  test('TC_002_Meeting room_Debriefing_For moderator', async () => {
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

  test('TC_003_Meeting room_Debriefing_End of the conference', async () => {
    expect(await meetingRoomPage.getNumberOfParticipantsInMeeting()).toBe(2);
    await meetingRoomPage.startDebriefingModeratorTool();
    await meetingRoomPage.selectDebriefingOption(meetingRoomPage.debriefingOptions.endOfTheConferenceOption);

    const moderatorLobbyRoomPage = new LobbyRoomPage({ page: meetingRoomPage.page });
    await expect(moderatorLobbyRoomPage.openTalkLogo).toBeVisible();
    await expect(moderatorLobbyRoomPage.conferenceCloseAlerts.conferenceCloseForAllAlertNotification).toBeVisible();

    await guestMeetingRoomPage.page.bringToFront();
    const guestLobbyRoomPage = new LobbyRoomPage({ page: guestMeetingRoomPage.page });
    await expect(guestLobbyRoomPage.openTalkLogo).toBeVisible();
    await expect(guestLobbyRoomPage.conferenceCloseAlerts.conferenceCloseAlertNotification).toBeVisible();
    // TODO: Need to assert that the registered invited users are in the lobby, once invited user scenario is implemented
  });
});
