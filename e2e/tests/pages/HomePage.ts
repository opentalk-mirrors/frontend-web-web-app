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
  }

  async deleteMeeting(meetingTitle: string): Promise<void> {
    await this.page
      .getByRole('listitem')
      .filter({ hasText: meetingTitle })
      .getByRole('button', { name: 'More Options' })
      .click();
    await this.page.getByRole('menuitem', { name: 'Delete' }).click();
    await this.page.getByRole('button', { name: 'Delete' }).click();
  }
}
