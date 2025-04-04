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

  async navigateToHomePage(): Promise<void> {
    const baseUrl = process.env.INSTANCE_URL;
    await Promise.all([
      this.page.waitForResponse(
        (response) => response.request().method() === 'GET' && (response.status() === 200 || response.status() === 304)
      ),
      this.page.goto(baseUrl, { waitUntil: 'load' }),
      this.page.waitForLoadState('networkidle'),
    ]);
  }

  async markMeetingAsFavourite(meetingTitle: string): Promise<void> {
    await this.getThreeDotMenuOfMeeting(meetingTitle).click();
    const ariaLabel = `Add ${meetingTitle} to favorites`;
    await this.page.getByRole('menuitem', { name: ariaLabel }).click();
    await this.getFavouriteMeetingSelector(meetingTitle).waitFor({ state: 'visible' });
  }

  getFavouriteMeetingSelector(meetingTitle: string): Locator {
    return this.page.getByRole('link', { name: meetingTitle, exact: true });
  }
  getStartMeetingButton(meetingTitle: string): Locator {
    return this.page.getByRole('link', { name: 'Start ' + meetingTitle, exact: true }).first();
  }

  getThreeDotMenuOfMeeting(meetingTitle: string): Locator {
    return this.page
      .getByRole('listitem')
      .filter({ hasText: meetingTitle })
      .getByRole('button', { name: 'More Options' })
      .first();
  }

  async deleteMeeting(meetingTitle: string): Promise<void> {
    await this.getThreeDotMenuOfMeeting(meetingTitle).click();
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

    // After deletion, wait for the frontend to update the list:
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          response.request().url().includes('/events?') &&
          response.request().method() === 'GET' &&
          response.status() === 200
      ),
      this.page.waitForLoadState('networkidle'),
    ]);
  }

  async deleteAllCreatedMeetings(meetingTitle: string): Promise<void> {
    let elements = await this.page.getByTitle(meetingTitle);
    let count = await elements.count();
    // The UI only shows a maximum of four meetings in the dashboard at a time
    // We need to ensure all meetings are deleted if more than four exist
    while (count > 0) {
      await this.deleteMeeting(meetingTitle);
      elements = await this.page.getByTitle(meetingTitle);
      count = await elements.count();
    }
  }
}
