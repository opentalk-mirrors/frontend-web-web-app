// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Locator, Page } from '@playwright/test';

export class TalkingStickPage {
  private readonly page: Page;
  private readonly talkingStickButton: Locator;

  private readonly startNowButton: Locator;
  public readonly talkingStickStartedNotification: Locator;
  public readonly yourTurnPopup: Locator;

  constructor({ page }: { page: Page }) {
    this.page = page;
    this.talkingStickButton = this.page.getByRole('tab', { name: 'Talking Stick' });

    this.startNowButton = this.page.getByRole('button', { name: 'Start now' });
    this.talkingStickStartedNotification = this.page.getByText('The Talking Stick is started.', { exact: true });
    this.yourTurnPopup = this.page.getByText("It's your turn now. Please turn on the microphone!", { exact: true });
  }

  public async clickOnTalkingStick(): Promise<void> {
    await this.talkingStickButton.click();
  }

  public async clickOnTalkingStickStartNow(): Promise<void> {
    await this.startNowButton.click();
  }
}
