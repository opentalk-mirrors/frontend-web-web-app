// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test, expect } from '@playwright/test';

import { HomePage } from '../pages/HomePage';
import { LobbyRoomPage } from '../pages/LobbyRoomPage';
import { MeetingPage } from '../pages/MeetingPage';

test.describe('Accessibility', () => {
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
    const meetingPage = new MeetingPage({ page });
    const lobbyPage = await meetingPage.goToMeetingLobby();
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
});
