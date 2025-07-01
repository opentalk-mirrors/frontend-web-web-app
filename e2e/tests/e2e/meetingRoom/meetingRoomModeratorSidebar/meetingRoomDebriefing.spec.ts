// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test, expect } from '@playwright/test';

import { joinMeetingRoomAsGuest, startAdhocMeetingAsModerator } from '../../../helper/meetingHelpers';
import { LobbyRoomPage } from '../../../pages/LobbyRoomPage';
import { MeetingRoomPage } from '../../../pages/MeetingRoom/MeetingRoomPage';
import { DebriefingPage } from '../../../pages/MeetingRoom/ModeratorTools/DebriefingPage';

test.describe('Meeting Room_Debriefing', () => {
  let meetingRoomPage: MeetingRoomPage,
    guestLink: string,
    guestMeetingRoomPage: MeetingRoomPage,
    debriefingPage: DebriefingPage;

  test.beforeEach(async ({ page, context, browserName }) => {
    ({ meetingRoomPage, guestLink } = await startAdhocMeetingAsModerator(page, browserName));
    guestMeetingRoomPage = await joinMeetingRoomAsGuest(context, guestLink, 'guest');
    // TODO: Need to add pre-condition to join meeting as few invited participants, once invited user scenario is implemented
    await meetingRoomPage.page.bringToFront();
  });

  test('TC_001_Meeting room_Debriefing_For moderator + registered user', async ({ page }) => {
    debriefingPage = new DebriefingPage(page);
    await debriefingPage.startDebriefingModeratorTool();
    await expect(debriefingPage.debriefingOptions.endOfTheConferenceOption).toBeVisible();
    await expect(debriefingPage.debriefingOptions.forModeratorOption).toBeVisible();
    await expect(debriefingPage.debriefingOptions.forModeratorAndRegisteredUserOption).toBeVisible();

    await debriefingPage.selectDebriefingOption(debriefingPage.debriefingOptions.forModeratorAndRegisteredUserOption);
    await expect(debriefingPage.debriefingInitAlert).toBeVisible();
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

  test('TC_002_Meeting room_Debriefing_For moderator', async ({ page }) => {
    debriefingPage = new DebriefingPage(page);
    await debriefingPage.startDebriefingModeratorTool();
    await debriefingPage.selectDebriefingOption(debriefingPage.debriefingOptions.forModeratorOption);
    await expect(debriefingPage.debriefingInitAlert).toBeVisible();
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

  test('TC_003_Meeting room_Debriefing_End of the conference', async ({ page }) => {
    debriefingPage = new DebriefingPage(page);
    expect(await meetingRoomPage.getNumberOfParticipantsInMeeting()).toBe(2);
    await debriefingPage.startDebriefingModeratorTool();
    await debriefingPage.selectDebriefingOption(debriefingPage.debriefingOptions.endOfTheConferenceOption);

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
