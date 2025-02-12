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
}
