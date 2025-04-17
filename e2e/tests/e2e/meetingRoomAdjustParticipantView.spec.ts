// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test, expect } from '@playwright/test';

import { HomePage } from '../pages/HomePage';
import { LobbyRoomPage } from '../pages/LobbyRoomPage';
import { MeetingInvitationPage } from '../pages/MeetingInvitationPage';
import { MeetingRoomPage } from '../pages/MeetingRoomPage';

const NUMBER_OF_GUESTS = 5;

const joinMeetingRoomAsGuest = async (context, guestLink: string, guestName: string): Promise<void> => {
  const joinAsGuestPage = await context.newPage();
  await joinAsGuestPage.goto(guestLink);

  const guestLobbyRoomPage = new LobbyRoomPage({ page: joinAsGuestPage });
  await expect(guestLobbyRoomPage.nameInputField).toBeVisible();
  await guestLobbyRoomPage.nameInputField.fill(guestName);

  await guestLobbyRoomPage.joinMeetingButton.click();
  const guestMeetingRoomPage = new MeetingRoomPage({ page: joinAsGuestPage });

  await expect(guestMeetingRoomPage.meetingRoomName).toBeVisible();
  await guestMeetingRoomPage.meetingRoomName.waitFor();
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

    // launch OpenTalk & start new (adhoc) meeting
    const homePage = new HomePage({ page });
    await homePage.navigateToHomePage();
    await homePage.startNewMeetingButton.click();

    const meetingInvitationPage = new MeetingInvitationPage({ page });
    await meetingInvitationPage.goToAdhocMeetingLobbyAsModerator(true);

    const lobbyRoomPage = new LobbyRoomPage({ page });
    await lobbyRoomPage.renderLobbyPageFully();

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

  test('TC_002_VideoRoom_ParticipantViewSettings_List_SpeakerView', async ({ page, context, browserName }) => {
    test.skip(browserName === 'webkit');

    // launch OpenTalk & start new (adhoc) meeting
    const homePage = new HomePage({ page });
    await homePage.navigateToHomePage();

    await homePage.startNewMeetingButton.click();

    const meetingInvitationPage = new MeetingInvitationPage({ page });
    const guestLink = await meetingInvitationPage.goToAdhocMeetingLobbyAsModeratorAndGetGuestLink(true);

    const lobbyRoomPage = new LobbyRoomPage({ page });
    await lobbyRoomPage.renderLobbyPageFully();

    // enter meeting room
    await lobbyRoomPage.joinMeetingButton.click();
    const meetingRoomPage = new MeetingRoomPage({ page });

    // assert meeting room is shown
    await expect(meetingRoomPage.meetingRoomName).toBeVisible();
    await expect(await meetingRoomPage.getMeetingRoomName()).toContain('Ad-hoc Meeting');

    // open grid view options besides the meeting room name
    await meetingRoomPage.viewOptions.viewOptionsButton.waitFor();
    await meetingRoomPage.viewOptions.viewOptionsButton.click();

    // choose speaker view
    // grid view should have a tick, but speaker view should have no tick before it is selected
    await expect(await meetingRoomPage.hasTickIcon(meetingRoomPage.viewOptions.gridViewOption)).toBeTruthy();
    await expect(await meetingRoomPage.hasTickIcon(meetingRoomPage.viewOptions.speakerViewOption)).toBeFalsy();
    await meetingRoomPage.viewOptions.speakerViewOption.click();
    await expect(await meetingRoomPage.hasTickIcon(meetingRoomPage.viewOptions.speakerViewOption)).toBeTruthy();

    // only moderator is present before guests join
    await expect(await meetingRoomPage.getNumberOfParticipantsInMeeting()).toBe(1);

    // join with 5 guests (in separate browser instances)
    await joinMeetingRoomWithNGuests(meetingRoomPage, context, guestLink, 'guest', NUMBER_OF_GUESTS);
    await meetingRoomPage.peopleButton.click();
    await expect(await meetingRoomPage.getNumberOfParticipantsInMeeting()).toBe(NUMBER_OF_GUESTS + 1);

    // check the speaker view and pin some users
    const defaultPinnedParticipant = await meetingRoomPage.getPinnedParticipantNameInSpeakerView();
    // speaker is in first place
    await expect(
      await page
        .getByTestId('SpeakerView-Container')
        .getByTestId('ParticipantWindow')
        .first()
        .getByTestId('nameTile')
        .innerText()
    ).toBe(defaultPinnedParticipant);
    // pinned user is shown first among all participant thumbs
    await expect(
      await page.getByTestId('ThumbsHolder').getByTestId('ParticipantWindow').nth(0).getByTestId('nameTile').innerText()
    ).toBe(defaultPinnedParticipant);
    // pin some user (3rd participant)
    const pinnedParticipant = await meetingRoomPage.pinNthParticipantInSpeakerView(3);
    await expect(defaultPinnedParticipant).not.toBe(pinnedParticipant);
    await expect(await meetingRoomPage.getPinnedParticipantNameInSpeakerView()).toBe(pinnedParticipant);
    // pin another user (2nd participant)
    const pinnedParticipant2 = await meetingRoomPage.pinNthParticipantInSpeakerView(2);
    await expect(await meetingRoomPage.getPinnedParticipantNameInSpeakerView()).toBe(pinnedParticipant2);
  });
});
