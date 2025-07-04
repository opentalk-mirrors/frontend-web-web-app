// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Page, expect } from '@playwright/test';

import { HomePage } from '../pages/HomePage';
import { LobbyRoomPage } from '../pages/LobbyRoomPage';
import { MeetingRoomPage } from '../pages/MeetingRoom/MeetingRoomPage';
import { closeWebkitPopUp } from './webkit';

export const startAdhocMeetingAsModerator = async (
  page: Page,
  browserName?: 'webkit' | 'chromium' | 'firefox'
): Promise<{ meetingRoomPage: MeetingRoomPage; guestLink: string }> => {
  // launch OpenTalk & start new (adhoc) meeting
  const homePage = new HomePage({ page });
  await homePage.navigateToHomePage();

  // Warning button in safari blocks the selector for creating new meeting
  if (browserName === 'webkit') {
    await closeWebkitPopUp({ page });
  }

  const meetingInvitationPage = await homePage.startAdhocMeeting();
  const guestLink = await meetingInvitationPage.getGuestLink();
  const lobbyRoomPage = await meetingInvitationPage.navigateToMeetingLobby();
  await expect(lobbyRoomPage.nameInputField).toBeVisible(); // needed because of flakyness (see issue #1692)

  // enter meeting room & assert meeting room is shown
  const meetingRoomPage = await lobbyRoomPage.enterMeetingRoom();
  await meetingRoomPage.meetingRoomName.isVisible();
  await expect(await meetingRoomPage.getMeetingRoomName()).toContain('Ad-hoc Meeting');

  // only moderator is present before guests join
  await expect(await meetingRoomPage.getNumberOfParticipantsInMeeting()).toBe(1);

  return { meetingRoomPage, guestLink };
};

export const joinMeetingRoomAsGuest = async (
  context,
  guestLink: string,
  guestName: string
): Promise<MeetingRoomPage> => {
  // create new browser instance & launch OpenTalk with guest link
  const newPage = await context.newPage();
  await newPage.goto(guestLink);
  await newPage.waitForLoadState('domcontentloaded', { timeout: 10_000 });

  const guestLobbyRoomPage = new LobbyRoomPage({ page: newPage });
  await expect(guestLobbyRoomPage.nameInputField).toBeVisible();
  await guestLobbyRoomPage.nameInputField.fill(guestName);

  // enter meeting room & assert meeting room is shown
  const guestMeetingRoomPage = await guestLobbyRoomPage.enterMeetingRoom();
  await guestMeetingRoomPage.meetingRoomName.waitFor();
  await expect(guestMeetingRoomPage.meetingRoomName).toBeVisible();

  return guestMeetingRoomPage;
};

export const joinMeetingRoomWithNGuests = async (
  page,
  context,
  guestLink: string,
  guestBaseName: string,
  numberOfGuests: number
): Promise<MeetingRoomPage[]> => {
  const guestMeetingRoomPages: MeetingRoomPage[] = [];

  for (let i = 1; i <= numberOfGuests; i++) {
    const guestUserName = guestBaseName + i;
    const guestMeetingRoomPage = await joinMeetingRoomAsGuest(context, guestLink, guestUserName);
    guestMeetingRoomPages.push(guestMeetingRoomPage);
  }

  return guestMeetingRoomPages;
};

export const planNewMeetingAndStartAsModerator = async (
  page: Page,
  meetingTitle: string,
  meetingPassword?: string,
  browserName?: 'webkit' | 'chromium' | 'firefox'
): Promise<{
  meetingRoomPage: MeetingRoomPage;
  guestLink: string;
  phoneDialIn: string;
  telephoneDialInNumber: string;
  conferenceId: string;
  conferencePin: string;
}> => {
  const homePage = new HomePage({ page });
  await homePage.navigateToHomePage();

  // Warning button in safari blocks the selector for creating new meeting
  if (browserName === 'webkit') {
    await closeWebkitPopUp({ page });
  }

  const meetingPlanningPage = await homePage.planNewMeeting();
  const meetingInvitationPage = await meetingPlanningPage.createNewMeeting(meetingTitle, meetingPassword);
  const guestLink = await meetingInvitationPage.getGuestLink();
  const { phoneDialIn, telephoneDialInNumber, conferenceId, conferencePin } =
    await meetingInvitationPage.getPhoneDialInDetails();
  const lobbyRoomPage = await meetingInvitationPage.navigateToMeetingLobby();
  await expect(lobbyRoomPage.nameInputField).toBeVisible(); // needed because of flakyness (see issue #1692)

  const meetingRoomPage = await lobbyRoomPage.enterMeetingRoom();
  await meetingRoomPage.meetingRoomName.isVisible();
  expect(await meetingRoomPage.getMeetingRoomName()).toContain(meetingTitle);

  return { meetingRoomPage, guestLink, phoneDialIn, telephoneDialInNumber, conferenceId, conferencePin };
};
