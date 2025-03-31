// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Page, Locator } from '@playwright/test';

export class HomePage {
  page: Page;
  planNewMeetingButton: Locator;
  startNewMeetingButton: Locator;
  joinExistingMeetingButton: Locator;

  constructor({ page }: { page: Page }) {
    this.page = page;
    this.planNewMeetingButton = this.page.getByRole('link', { name: 'Plan new' });
    this.startNewMeetingButton = this.page.getByRole('link', { name: 'Start new' });
    this.joinExistingMeetingButton = this.page.getByRole('button', { name: 'Join existing' });
  }

  async markMeetingAsFavourite(meetingTitle: string): Promise<void> {
    await this.page
      .getByRole('listitem')
      .filter({ hasText: meetingTitle })
      .getByRole('button', { name: 'More Options' })
      .click();
    const ariaLabel = `Add ${meetingTitle} to favorites`;
    await this.page.getByRole('menuitem', { name: ariaLabel }).click();
    await this.getFavouriteMeetingSelector(meetingTitle).waitFor({ state: 'visible' });
  }

  getFavouriteMeetingSelector(meetingTitle: string): Locator {
    return this.page.getByRole('link', { name: meetingTitle, exact: true });
  }
  getStartMeetingButton(meetingTitle: string): Locator {
    return this.page.getByRole('link', { name: 'Start ' + meetingTitle, exact: true });
  }

  getThreeDotMenuOfMeeting(meetingTitle: string): Locator {
    return this.page
      .getByRole('listitem')
      .filter({ hasText: meetingTitle })
      .getByRole('button', { name: 'More Options' });
  }

  async deleteMeeting(meetingTitle: string): Promise<void> {
    await this.page
      .getByRole('listitem')
      .filter({ hasText: meetingTitle })
      .getByRole('button', { name: 'More Options' })
      .click();
    await this.page.getByRole('menuitem', { name: 'Delete' }).click();
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          response.request().url().includes('/events/') &&
          response.request().method() === 'DELETE' &&
          response.status() === 204
      ),
      this.page.getByRole('button', { name: 'Delete' }).click(),
    ]);
  }
}
