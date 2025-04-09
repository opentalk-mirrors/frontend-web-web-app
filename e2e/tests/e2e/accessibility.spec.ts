// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test, expect } from '@playwright/test';

import { closeWebkitPopUp } from '../helper/webkit';
import { HomePage } from '../pages/HomePage';
import { LobbyRoomPage } from '../pages/LobbyRoomPage';
import { MeetingInvitationPage } from '../pages/MeetingInvitationPage';
import { MeetingRoomPage } from '../pages/MeetingRoomPage';
import { PlanMeetingPage } from '../pages/PlanMeetingPage';
import { SidebarPage } from '../pages/SidebarPage';

const meetingTitle = 'test_meeting';
const meetingRoomPassword = 'test1234';
const createdMeetingStore = [];

test.describe('Accessibility', () => {
  test.afterEach(async ({ page }) => {
    if (createdMeetingStore.length === 1) {
      await page.goto(process.env.INSTANCE_URL);
      await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
      const homePage = new HomePage({ page });
      await homePage.deleteMeeting(meetingTitle);
      createdMeetingStore.pop();
      await page.close();
    }
  });

  test('TC_001_Dashboard', async ({ page, browserName }) => {
    const sidebarPage = new SidebarPage({ page });
    const homePage = new HomePage({ page });
    const baseUrl = process.env.INSTANCE_URL;
    await homePage.navigateToHomePage();

    // Warning button in safari blocks the selector for creating new meeting
    if (browserName === 'webkit') {
      await closeWebkitPopUp({ page });
    }
    // cleaning anymeeting in dashboard
    await homePage.deleteAllCreatedMeetings(meetingTitle);
    await homePage.planNewMeetingButton.click();
    const planMeetingPage = new PlanMeetingPage({ page });
    await planMeetingPage.createNewMeeting(meetingTitle, meetingRoomPassword);
    createdMeetingStore.push(meetingTitle);
    await sidebarPage.homeButton.click();
    await homePage.markMeetingAsFavourite(meetingTitle);
    await sidebarPage.getProfileLocator().focus();
    // cursor will now be in the beginning of tabable element
    await page.keyboard.press('Tab');
    await expect(sidebarPage.homeButton).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(sidebarPage.meetingsButton).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(sidebarPage.helpButton).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(sidebarPage.settingButton).toBeFocused();
    await page.keyboard.press('Tab');

    // there is no legal options for the testing server
    if (!baseUrl.startsWith('http://')) {
      await expect(sidebarPage.legalButton).toBeFocused();
      await page.keyboard.press('Tab');
    }
    await expect(sidebarPage.logoutButton).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(sidebarPage.closeNavigationButton).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(homePage.planNewMeetingButton).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(homePage.startNewMeetingButton).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(homePage.joinExistingMeetingButton).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(homePage.getFavouriteMeetingSelector(meetingTitle)).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(homePage.getThreeDotMenuOfMeeting(meetingTitle)).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(homePage.getStartMeetingButton(meetingTitle)).toBeFocused();
  });

  test('TC_002_Lobby', async ({ page, browserName }) => {
    // Camera and Microphone permissions are not being granted in Firefox and Safari
    // Thus they cannot be accessed by keyboard "Tab"
    // https://github.com/microsoft/playwright/issues/20563
    test.skip(browserName === 'webkit' || browserName === 'firefox');
    test.setTimeout(120000);
    const baseUrl = process.env.INSTANCE_URL;
    await page.goto(baseUrl);
    const homePage = new HomePage({ page });
    await homePage.startNewMeetingButton.click();
    const meetingInvitationPage = new MeetingInvitationPage({ page });
    const lobbyPage = await meetingInvitationPage.goToMeetingLobby();
    const lobbyRoomPage = new LobbyRoomPage({ page: lobbyPage });
    // checking whether the lobby page is fully loaded
    // microphone takes some time to load depending on browser
    await expect(lobbyRoomPage.nameInputField).toBeVisible();
    await expect(lobbyRoomPage.microphoneButton).toBeEnabled();
    await lobbyRoomPage.isMicrophoneEnabled();
    await lobbyPage.keyboard.press('Tab');
    await lobbyPage.keyboard.press('Tab');
    await expect(lobbyRoomPage.speedTestButton).toBeFocused();
    await lobbyPage.keyboard.press('Tab');
    await expect(lobbyRoomPage.threeDotMenuButton).toBeFocused();
    await lobbyPage.keyboard.press('Tab');
    await expect(lobbyRoomPage.backButton).toBeFocused();
    await lobbyPage.keyboard.press('Tab');
    await expect(lobbyRoomPage.nameInputField).toBeFocused();
    await lobbyPage.keyboard.press('Tab');
    await expect(lobbyRoomPage.microphoneButton).toBeFocused();
    await lobbyPage.keyboard.press('Tab');
    await expect(lobbyRoomPage.microphoneMoreOptionsMenuButton).toBeFocused();
    await lobbyPage.keyboard.press('Tab');
    await expect(lobbyRoomPage.videoButton).toBeFocused();
    await lobbyPage.keyboard.press('Tab');
    await expect(lobbyRoomPage.cameraMoreOptionsMenuButton).toBeFocused();
    await lobbyPage.keyboard.press('Tab');
    await expect(lobbyRoomPage.blurBackgroundButton).toBeFocused();
    await lobbyPage.keyboard.press('Tab');
    await expect(lobbyRoomPage.joinMeetingButton).toBeFocused();
    await lobbyPage.keyboard.press('Tab');
    // there is no imprint and dataprotection link for the testing server
    if (!baseUrl.startsWith('http://')) {
      await expect(lobbyRoomPage.imprintLink).toBeFocused();
      await lobbyPage.keyboard.press('Tab');
      await expect(lobbyRoomPage.dataProtectionLink).toBeFocused();
    }
    await lobbyPage.close();
  });

  test('TC_003_Meeting_Room', async ({ page, browserName }) => {
    // Camera and Microphone permissions are not being granted in Firefox and Safari in CI
    // Thus they cannot be accessed by keyboard "Tab"
    // https://github.com/microsoft/playwright/issues/20563
    test.skip(browserName === 'webkit' || browserName === 'firefox');
    // launch OpenTalk
    await page.goto(process.env.INSTANCE_URL);

    // start new (adhoc) meeting
    const homePage = new HomePage({ page });
    await homePage.startNewMeetingButton.click();

    const meetingInvitationPage = new MeetingInvitationPage({ page });
    await meetingInvitationPage.goToAdhocMeetingLobbyAsModerator(true);

    const lobbyRoomPage = new LobbyRoomPage({ page });
    // from meeting-room-timer.spec.ts
    // "We need to wait for the username to appear here because otherwise the tests will be flaky (see issue #1692)"
    await expect(lobbyRoomPage.nameInputField).toBeVisible();

    // enter meeting room
    // need to wait for meetingbutton to be clickable
    await page.waitForTimeout(4000);
    await lobbyRoomPage.joinMeetingButton.click();
    const meetingRoomPage = new MeetingRoomPage({ page });

    // assert meeting room is shown
    await expect(meetingRoomPage.meetingRoomName).toBeVisible();
    await expect(await meetingRoomPage.getMeetingRoomName()).toContain('Ad-hoc Meeting');
    await meetingRoomPage.renderMeetingRoom();
    await meetingRoomPage.jumpLinks.skipToModerationPanelLink.focus();
    await expect(meetingRoomPage.jumpLinks.skipToModerationPanelLink).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(meetingRoomPage.jumpLinks.skipToMyMeetingMenuLink).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(meetingRoomPage.jumpLinks.skipToPersonalControlPanelLink).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(meetingRoomPage.viewOptions.viewOptionsButton).toBeFocused();
    await page.keyboard.press('Tab');
    // secure tick icon doesn't appear if server is running on http
    if (!process.env.INSTANCE_URL.startsWith('http://')) {
      await expect(meetingRoomPage.securityMonitorButton).toBeFocused();
      await page.keyboard.press('Tab');
    }
    await expect(meetingRoomPage.burgerMenuButton).toBeFocused();
    await page.keyboard.press('Tab');

    const moderationButtons = [
      meetingRoomPage.moderationTools.homeButton,
      meetingRoomPage.moderationTools.muteParticipantsButton,
      meetingRoomPage.moderationTools.resetRaisedHandsButton,
      meetingRoomPage.moderationTools.talkingStickButton,
      meetingRoomPage.moderationTools.pollButton,
      meetingRoomPage.moderationTools.votingButton,
      meetingRoomPage.moderationTools.meetingNotesButton,
      meetingRoomPage.moderationTools.whiteboardButton,
      meetingRoomPage.moderationTools.createBreakoutRoomsButton,
      meetingRoomPage.moderationTools.timerButton,
      meetingRoomPage.moderationTools.coffeeBreakButton,
      meetingRoomPage.moderationTools.debriefingButton,
    ];

    for (const button of moderationButtons) {
      await expect(button).toBeFocused();
      await page.keyboard.press('ArrowDown');
    }
    await page.keyboard.press('Tab');
    await expect(meetingRoomPage.chatButton).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(meetingRoomPage.peopleButton).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(meetingRoomPage.messageButton).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(meetingRoomPage.searchInChatButton).toBeFocused();
    await page.keyboard.press('Tab');

    await expect(meetingRoomPage.emojiPicker).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(meetingRoomPage.chatTextField).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(meetingRoomPage.chatSubmitButton).toBeFocused();
    await page.keyboard.press('Tab');

    const toolBarButtons = [
      meetingRoomPage.toolBar.handRaiseButton,
      meetingRoomPage.toolBar.turnOnScreenShareButton,
      meetingRoomPage.toolBar.microphoneButton,
      meetingRoomPage.toolBar.microphoneMoreOptionsMenuButton,
      meetingRoomPage.toolBar.videoButton,
      meetingRoomPage.toolBar.cameraMoreOptionButton,
      meetingRoomPage.toolBar.moreOptionButton,
      meetingRoomPage.toolBar.endMeetingButton,
    ];

    for (const button of toolBarButtons) {
      await expect(button).toBeFocused();
      await page.keyboard.press('Tab');
    }
  });
});
