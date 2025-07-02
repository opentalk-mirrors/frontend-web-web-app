// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Locator, Page } from '@playwright/test';

export class DebriefingPage {
  private readonly page: Page;
  private readonly debriefingButton: Locator;

  public readonly debriefingOptions: {
    endOfTheConferenceOption: Locator;
    forModeratorOption: Locator;
    forModeratorAndRegisteredUserOption: Locator;
  };

  public readonly debriefingInitAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.debriefingButton = this.page.getByRole('tab', { name: 'Debriefing' });

    this.debriefingOptions = {
      endOfTheConferenceOption: this.page.getByRole('button', { name: 'End of the conference' }),
      forModeratorOption: this.page.getByRole('button', { name: 'For moderator', exact: true }),
      forModeratorAndRegisteredUserOption: this.page.getByRole('button', {
        name: 'For moderator + registered user',
        exact: true,
      }),
    };

    this.debriefingInitAlert = this.page.getByText('Debriefing initiated - Waiting room is activated.', {
      exact: true,
    });
  }

  public async startDebriefingModeratorTool(): Promise<void> {
    await this.debriefingButton.click();
  }

  public async selectDebriefingOption(debriefingOptionButton: Locator): Promise<void> {
    await debriefingOptionButton.click();
  }
}
