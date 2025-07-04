// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Page, Locator } from '@playwright/test';

import { MeetingRoomPage } from './MeetingRoom/MeetingRoomPage';

export class LobbyRoomPage {
  page: Page;
  openTalkLogo: Locator;
  speedTestButton: Locator;
  threeDotMenuButton: Locator;
  openUserManualButton: Locator;
  backButton: Locator;
  nameInputField: Locator;
  microphoneButton: Locator;
  microphoneMoreOptionsMenuButton: Locator;
  videoButton: Locator;
  cameraMoreOptionsMenuButton: Locator;
  blurBackgroundButton: Locator;
  joinMeetingButton: Locator;
  imprintLink: Locator;
  dataProtectionLink: Locator;

  conferenceCloseAlerts: {
    conferenceCloseAlertNotification: Locator;
    conferenceCloseForAllAlertNotification: Locator;
  };

  constructor({ page }: { page: Page }) {
    this.page = page;
    this.openTalkLogo = this.page.getByRole('button', { name: 'Go to dashboard' });
    this.speedTestButton = this.page.getByRole('button', { name: 'Start Speed-Test' });
    this.threeDotMenuButton = this.page.getByRole('button', { name: 'My meeting' });
    this.backButton = this.page.getByRole('button', { name: 'Back', exact: true });
    this.openUserManualButton = this.page.getByRole('button', { name: 'Open user manual' });
    this.nameInputField = this.page.getByRole('textbox', { name: 'Name' });
    this.microphoneButton = this.page.getByRole('button', { name: 'Turn On Audio', exact: true });
    this.microphoneMoreOptionsMenuButton = this.page.getByRole('button', { name: 'additional options microphone' });
    this.videoButton = this.page.getByRole('button', { name: 'Turn On Video', exact: true });
    this.cameraMoreOptionsMenuButton = this.page.getByRole('button', { name: 'additional options camera' });
    this.blurBackgroundButton = this.page.getByRole('button', { name: 'Turn On Background Blur' });
    this.joinMeetingButton = this.page.getByRole('button', { name: 'Enter now' });
    this.imprintLink = this.page.getByRole('link', { name: 'Imprint' });
    this.dataProtectionLink = this.page.getByRole('link', { name: 'Data protection' });

    this.conferenceCloseAlerts = {
      conferenceCloseAlertNotification: this.page.getByText('The conference was closed by the moderator.', {
        exact: true,
      }),
      conferenceCloseForAllAlertNotification: this.page.getByText('The conference is ended for all.', { exact: true }),
    };
  }

  public async waitForMicrophoneButtonToBeEnabled(): Promise<boolean> {
    await this.microphoneButton.isVisible();
    let count = 0;
    while (count < 20 && (await !this.microphoneButton.isEnabled())) {
      this.page.waitForTimeout(500);
      count++;
    }
    return await this.microphoneButton.isEnabled();
  }

  async enterMeetingRoom(): Promise<MeetingRoomPage> {
    await this.renderLobbyPage();
    await this.joinMeetingButton.isVisible();
    await this.joinMeetingButton.click();
    await this.page.waitForLoadState('load');
    return new MeetingRoomPage({ page: this.page });
  }

  async waitForParticipantNameToBeVisibleInNameField(): Promise<void> {
    // from meeting-room-timer.spec.ts
    // "We need to wait for the username to appear here because otherwise the tests will be flaky (see issue #1692)"
    let userName = '';
    let counter = 0;
    while (userName === '' && counter < 5) {
      userName = await this.nameInputField.inputValue();
      counter++;
      await this.page.waitForTimeout(500);
    }
  }

  async renderLobbyPage(): Promise<void> {
    await this.nameInputField.waitFor({ state: 'visible' });
    await this.waitForParticipantNameToBeVisibleInNameField();
  }
}
