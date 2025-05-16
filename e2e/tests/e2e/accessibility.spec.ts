// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test, expect } from '@playwright/test';

import { startAdhocMeetingAsModerator } from '../helper/meetingHelpers';
import { closeWebkitPopUp } from '../helper/webkit';
import { HomePage } from '../pages/HomePage';
import { SidebarPage } from '../pages/SidebarPage';

const meetingTitle = 'test_meeting';
const meetingRoomPassword = 'test1234';
const createdMeetingStore: string[] = [];

test.describe('Accessibility_General', () => {
  test.afterEach(async ({ page }) => {
    if (createdMeetingStore.length === 1) {
      const homePage = new HomePage({ page });
      await homePage.navigateToHomePage();
      await homePage.deleteMeeting(meetingTitle);
      createdMeetingStore.pop();
      await page.close();
    }
  });

  test('TC_001_Dashboard', async ({ page, browserName }) => {
    const homePage = new HomePage({ page });
    await homePage.navigateToHomePage();

    // Warning button in safari blocks the selector for creating new meeting
    if (browserName === 'webkit') {
      await closeWebkitPopUp({ page });
    }

    // cleaning any meeting in dashboard
    await homePage.deleteAllCreatedMeetings(meetingTitle);

    const planMeetingPage = await homePage.planNewMeeting();
    await planMeetingPage.createNewMeeting(meetingTitle, meetingRoomPassword);
    createdMeetingStore.push(meetingTitle);
    await homePage.navigateToHomePage();
    await homePage.markMeetingAsFavourite(meetingTitle);

    const sidebarPage = new SidebarPage({ page });
    await sidebarPage.getProfileLocator().focus();
    // cursor will now be in the beginning of tabable element
    await sidebarPage.page.keyboard.press('Tab');
    await expect(sidebarPage.homeButton).toBeFocused();
    await sidebarPage.page.keyboard.press('Tab');
    await expect(sidebarPage.meetingsButton).toBeFocused();
    await sidebarPage.page.keyboard.press('Tab');
    await expect(sidebarPage.helpButton).toBeFocused();
    await sidebarPage.page.keyboard.press('Tab');
    await expect(sidebarPage.settingButton).toBeFocused();
    await sidebarPage.page.keyboard.press('Tab');

    // there is no legal options for the testing server
    if (!process.env.INSTANCE_URL.startsWith('http://')) {
      await expect(sidebarPage.legalButton).toBeFocused();
      await sidebarPage.page.keyboard.press('Tab');
    }
    await expect(sidebarPage.logoutButton).toBeFocused();
    await sidebarPage.page.keyboard.press('Tab');
    await expect(sidebarPage.closeNavigationButton).toBeFocused();
    await sidebarPage.page.keyboard.press('Tab');
    await expect(homePage.planNewMeetingButton).toBeFocused();
    await sidebarPage.page.keyboard.press('Tab');
    await expect(homePage.startNewMeetingButton).toBeFocused();
    await sidebarPage.page.keyboard.press('Tab');
    await expect(homePage.joinExistingMeetingButton).toBeFocused();
    await sidebarPage.page.keyboard.press('Tab');
    await expect(homePage.getFavouriteMeetingSelector(meetingTitle)).toBeFocused();
    await sidebarPage.page.keyboard.press('Tab');
    await expect(homePage.getThreeDotMenuOfMeeting(meetingTitle)).toBeFocused();
    await sidebarPage.page.keyboard.press('Tab');
    await expect(homePage.getStartMeetingButton(meetingTitle)).toBeFocused();
  });

  test('TC_002_Lobby', async ({ page, browserName }) => {
    // Camera and Microphone permissions are not being granted in Firefox and Safari
    // Thus they cannot be accessed by keyboard "Tab"
    // https://github.com/microsoft/playwright/issues/20563
    test.skip(browserName === 'webkit' || browserName === 'firefox');

    const homePage = new HomePage({ page });
    await homePage.navigateToHomePage();
    const meetingInvitationPage = await homePage.startAdhocMeeting();
    const lobbyRoomPage = await meetingInvitationPage.navigateToMeetingLobby();
    await lobbyRoomPage.microphoneButton.isVisible();
    await lobbyRoomPage.isMicrophoneEnabled();
    await lobbyRoomPage.renderLobbyPage();

    await lobbyRoomPage.page.keyboard.press('Tab');
    await lobbyRoomPage.page.keyboard.press('Tab');
    await expect(lobbyRoomPage.speedTestButton).toBeFocused();
    await lobbyRoomPage.page.keyboard.press('Tab');
    await expect(lobbyRoomPage.threeDotMenuButton).toBeFocused();
    await lobbyRoomPage.page.keyboard.press('Tab');
    await expect(lobbyRoomPage.backButton).toBeFocused();
    await lobbyRoomPage.page.keyboard.press('Tab');
    await expect(lobbyRoomPage.nameInputField).toBeFocused();
    await lobbyRoomPage.page.keyboard.press('Tab');
    await expect(lobbyRoomPage.microphoneButton).toBeFocused();
    await lobbyRoomPage.page.keyboard.press('Tab');
    await expect(lobbyRoomPage.microphoneMoreOptionsMenuButton).toBeFocused();
    await lobbyRoomPage.page.keyboard.press('Tab');
    await expect(lobbyRoomPage.videoButton).toBeFocused();
    await lobbyRoomPage.page.keyboard.press('Tab');
    await expect(lobbyRoomPage.cameraMoreOptionsMenuButton).toBeFocused();
    await lobbyRoomPage.page.keyboard.press('Tab');
    await expect(lobbyRoomPage.blurBackgroundButton).toBeFocused();
    await lobbyRoomPage.page.keyboard.press('Tab');
    await expect(lobbyRoomPage.joinMeetingButton).toBeFocused();
    await lobbyRoomPage.page.keyboard.press('Tab');
    // there is no imprint and dataprotection link for the testing server
    if (!process.env.INSTANCE_URL.startsWith('http://')) {
      await expect(lobbyRoomPage.imprintLink).toBeFocused();
      await lobbyRoomPage.page.keyboard.press('Tab');
      await expect(lobbyRoomPage.dataProtectionLink).toBeFocused();
    }
  });

  test('TC_003_Meeting_Room', async ({ page, browserName }) => {
    // Camera and Microphone permissions are not being granted in Firefox and Safari in CI
    // Thus they cannot be accessed by keyboard "Tab"
    // https://github.com/microsoft/playwright/issues/20563
    test.skip(browserName === 'webkit' || browserName === 'firefox');

    const { meetingRoomPage } = await startAdhocMeetingAsModerator(page);

    // assert meeting room is shown
    await expect(meetingRoomPage.meetingRoomName).toBeVisible();
    await expect(await meetingRoomPage.getMeetingRoomName()).toContain('Ad-hoc Meeting');
    await meetingRoomPage.renderMeetingRoom();

    await meetingRoomPage.jumpLinks.skipToModerationPanelLink.focus();
    await expect(meetingRoomPage.jumpLinks.skipToModerationPanelLink).toBeFocused();
    await meetingRoomPage.page.keyboard.press('Tab');
    await expect(meetingRoomPage.jumpLinks.skipToMyMeetingMenuLink).toBeFocused();
    await meetingRoomPage.page.keyboard.press('Tab');
    await expect(meetingRoomPage.jumpLinks.skipToPersonalControlPanelLink).toBeFocused();

    await meetingRoomPage.page.keyboard.press('Tab');
    await expect(meetingRoomPage.viewOptions.viewOptionsButton).toBeFocused();
    await meetingRoomPage.page.keyboard.press('Tab');
    // secure tick icon doesn't appear if server is running on http
    if (!process.env.INSTANCE_URL.startsWith('http://')) {
      await expect(meetingRoomPage.securityMonitorButton).toBeFocused();
      await meetingRoomPage.page.keyboard.press('Tab');
    }
    await expect(meetingRoomPage.burgerMenuButton).toBeFocused();
    await meetingRoomPage.page.keyboard.press('Tab');

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
      await meetingRoomPage.page.keyboard.press('ArrowDown');
    }

    await meetingRoomPage.page.keyboard.press('Tab');
    await expect(meetingRoomPage.chatButton).toBeFocused();
    await meetingRoomPage.page.keyboard.press('ArrowRight');
    await expect(meetingRoomPage.peopleButton).toBeFocused();
    await meetingRoomPage.page.keyboard.press('ArrowRight');
    await expect(meetingRoomPage.messageButton).toBeFocused();

    await meetingRoomPage.page.keyboard.press('Tab');
    await expect(meetingRoomPage.searchInChatButton).toBeFocused();
    await meetingRoomPage.page.keyboard.press('Tab');
    await expect(meetingRoomPage.emojiPicker).toBeFocused();
    await meetingRoomPage.page.keyboard.press('Tab');
    await expect(meetingRoomPage.chatTextField).toBeFocused();
    await meetingRoomPage.page.keyboard.press('Tab');
    await expect(meetingRoomPage.chatSubmitButton).toBeFocused();
    await meetingRoomPage.page.keyboard.press('Tab');

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
      await meetingRoomPage.page.keyboard.press('Tab');
    }
  });
});
