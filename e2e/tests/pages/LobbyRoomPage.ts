// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Page, Locator } from '@playwright/test';

export class LobbyRoomPage {
  page: Page;
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

  constructor({ page }: { page: Page }) {
    this.page = page;
    this.speedTestButton = this.page.getByRole('button', { name: 'Start Speed-Test' });
    this.threeDotMenuButton = this.page.getByRole('button', { name: 'My meeting' });
    this.backButton = this.page.getByRole('button', { name: 'Back', exact: true });
    this.openUserManualButton = this.page.getByRole('button', { name: 'Open user manual' });
    this.nameInputField = this.page.getByRole('textbox', { name: 'Name' });
    this.microphoneButton = this.page.getByRole('button', { name: 'Turn On Audio' });
    this.microphoneMoreOptionsMenuButton = this.page.getByRole('button', { name: 'additional options microphone' });
    this.videoButton = this.page.getByRole('button', { name: 'Turn On Video' });
    this.cameraMoreOptionsMenuButton = this.page.getByRole('button', { name: 'additional options camera' });
    this.blurBackgroundButton = this.page.getByRole('button', { name: 'Turn On Background Blur' });
    this.joinMeetingButton = this.page.getByRole('button', { name: 'Enter now' });
    this.imprintLink = this.page.getByRole('link', { name: 'Imprint' });
    this.dataProtectionLink = this.page.getByRole('link', { name: 'Data protection' });
  }

  async isMicrophoneEnabled(): Promise<void> {
    let tabindex;
    while (tabindex !== '0') {
      tabindex = await this.microphoneButton.getAttribute('tabindex');
    }
  }

  async enterMeetingRoom(): Promise<Page> {
    await this.renderLobbyPageFully();
    await this.joinMeetingButton.isVisible();
    await this.joinMeetingButton.click();
    await this.page.waitForLoadState('domcontentloaded');
    return this.page;
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

  async renderLobbyPageFully(): Promise<void> {
    await this.nameInputField.isVisible();
    await this.waitForParticipantNameToBeVisibleInNameField();
  }
}
