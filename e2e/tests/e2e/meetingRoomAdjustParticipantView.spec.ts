// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test, expect } from '@playwright/test';

import { HomePage } from '../pages/HomePage';
import { LobbyRoomPage } from '../pages/LobbyRoomPage';
import { MeetingInvitationPage } from '../pages/MeetingInvitationPage';
import { MeetingRoomPage } from '../pages/MeetingRoomPage';

const NUMBER_OF_GUESTS = 5;

const startAdhocMeetingAsModerator = async (page) => {
  // launch OpenTalk & start new (adhoc) meeting
  const homePage = new HomePage({ page });
  await homePage.navigateToHomePage();
  const meetingInvitationPage = new MeetingInvitationPage({ page: await homePage.startAdhocMeeting() });
  const guestLink = await meetingInvitationPage.getGuestLink();
  const lobbyRoomPage = new LobbyRoomPage({ page: await meetingInvitationPage.navigateToMeetingLobby() });
  await expect(lobbyRoomPage.nameInputField).toBeVisible(); // needed because of flakyness (see issue #1692)

  // enter meeting room & assert meeting room is shown
  const meetingRoomPage = new MeetingRoomPage({ page: await lobbyRoomPage.enterMeetingRoom() });
  await meetingRoomPage.meetingRoomName.isVisible();
  await expect(await meetingRoomPage.getMeetingRoomName()).toContain('Ad-hoc Meeting');

  // only moderator is present before guests join
  await expect(await meetingRoomPage.getNumberOfParticipantsInMeeting()).toBe(1);

  return { meetingRoomPage, guestLink };
};

const joinMeetingRoomAsGuest = async (context, guestLink: string, guestName: string): Promise<void> => {
  // create new browser instance & launch OpenTalk with guest link
  const newPage = await context.newPage();
  await newPage.goto(guestLink);
  await newPage.waitForLoadState('domcontentloaded', { timeout: 10_000 });

  const guestLobbyRoomPage = new LobbyRoomPage({ page: newPage });
  await expect(guestLobbyRoomPage.nameInputField).toBeVisible();
  await guestLobbyRoomPage.nameInputField.fill(guestName);

  // enter meeting room & assert meeting room is shown
  const guestMeetingRoomPage = new MeetingRoomPage({ page: await guestLobbyRoomPage.enterMeetingRoom() });
  await guestMeetingRoomPage.meetingRoomName.waitFor();
  await expect(guestMeetingRoomPage.meetingRoomName).toBeVisible();
};

const joinMeetingRoomWithNGuests = async (
  page,
  context,
  guestLink: string,
  guestBaseName: string,
  numberOfGuests: number
): Promise<number> => {
  const initialNumberOfParticipants = await page.getNumberOfParticipantsInMeeting();

  for (let i = 1; i <= numberOfGuests; i++) {
    const guestUserName = guestBaseName + i;
    await joinMeetingRoomAsGuest(context, guestLink, guestUserName);
  }

  const numberOfParticipantsAfterJoining = await page.getNumberOfParticipantsInMeeting();
  return numberOfParticipantsAfterJoining - initialNumberOfParticipants;
};

test.describe('MeetingRoom - adjust participant view', () => {
  test('TC_001_VideoRoom_ParticipantViewSettings_List', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit');

    const { meetingRoomPage } = await startAdhocMeetingAsModerator(page);

    // work around for differences between test server and local setup
    meetingRoomPage.allocateViewOptionLocatorsBasedOnSetup();

    // when opening grid view options besides the meeting room name
    await meetingRoomPage.displayViewOptionsMenu();
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

  test('TC_002_VideoRoom_ParticipantViewSettings_List_SpeakerView', async ({ page, context, browserName }) => {
    test.skip(browserName === 'webkit');

    const { meetingRoomPage, guestLink } = await startAdhocMeetingAsModerator(page);

    // join with 5 guests (in separate browser instances)
    await joinMeetingRoomWithNGuests(meetingRoomPage, context, guestLink, 'guest', NUMBER_OF_GUESTS);
    await meetingRoomPage.selectPeopleTab();
    await expect(await meetingRoomPage.getNumberOfParticipantsInMeeting()).toBe(NUMBER_OF_GUESTS + 1);

    // open grid view options besides the meeting room name
    await meetingRoomPage.displayViewOptionsMenu();

    // choose speaker view
    // grid view should have a tick, but speaker view should have no tick before it is selected
    await expect(await meetingRoomPage.hasTickIcon(meetingRoomPage.viewOptions.gridViewOption)).toBeTruthy();
    await expect(await meetingRoomPage.hasTickIcon(meetingRoomPage.viewOptions.speakerViewOption)).toBeFalsy();
    await meetingRoomPage.selectSpeakerViewOption();
    await expect(await meetingRoomPage.hasTickIcon(meetingRoomPage.viewOptions.speakerViewOption)).toBeTruthy();

    // check the speaker view and pin some users
    const defaultPinnedParticipant = await meetingRoomPage.getPinnedParticipantNameInSpeakerView();
    // speaker is in first place
    await expect(await meetingRoomPage.getFirstParticipantNameInSpeakerView()).toBe(defaultPinnedParticipant);
    // pinned user is shown first among all participant thumbs
    await expect(await meetingRoomPage.getThumbsNthParticipantNameInSpeakerView(1)).toBe(defaultPinnedParticipant);
    // pin some user (3rd participant)
    const pinnedParticipant = await meetingRoomPage.pinNthParticipantInSpeakerView(3);
    await expect(defaultPinnedParticipant).not.toBe(pinnedParticipant);
    await expect(await meetingRoomPage.getPinnedParticipantNameInSpeakerView()).toBe(pinnedParticipant);
    // pin another user (2nd participant)
    const pinnedParticipant2 = await meetingRoomPage.pinNthParticipantInSpeakerView(2);
    await expect(await meetingRoomPage.getPinnedParticipantNameInSpeakerView()).toBe(pinnedParticipant2);
  });

  test('TC_004_VideoRoom_ParticipantViewSettings_List_GridView', async ({ page, context, browserName }) => {
    test.skip(browserName === 'webkit');

    const { meetingRoomPage, guestLink } = await startAdhocMeetingAsModerator(page);

    // join with 5 guests (in separate browser instances)
    await joinMeetingRoomWithNGuests(meetingRoomPage, context, guestLink, 'guest', NUMBER_OF_GUESTS);
    await meetingRoomPage.selectPeopleTab();
    await expect(await meetingRoomPage.getNumberOfParticipantsInMeeting()).toBe(NUMBER_OF_GUESTS + 1);

    // open grid view options besides the meeting room name
    await meetingRoomPage.displayViewOptionsMenu();
    await meetingRoomPage.selectGridViewOption(); // optional since grid view is activated by default
    // tik is activated
    await expect(await meetingRoomPage.hasTickIcon(meetingRoomPage.viewOptions.gridViewOption)).toBeTruthy();

    // all 5 participant windows are centered
    for (let i = 1; i <= NUMBER_OF_GUESTS; i++) {
      await expect(await meetingRoomPage.getGridViewNthParticipantWindowAlignment(i)).toBe('center');
    }
    // all 5 participant windows have same size
    const firstParticipantWindowSize = await meetingRoomPage.getGridViewNthParticipantWindowSize(1);
    for (let i = 2; i <= NUMBER_OF_GUESTS; i++) {
      await expect(firstParticipantWindowSize).toBe(await meetingRoomPage.getGridViewNthParticipantWindowSize(i));
    }
  });
});
