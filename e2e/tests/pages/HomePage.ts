// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Page, Locator } from '@playwright/test';

import { MeetingInvitationPage } from './MeetingInvitationPage';
import { PlanMeetingPage } from './PlanMeetingPage';

export class HomePage {
  page: Page;
  planNewMeetingButton: Locator;
  startNewMeetingButton: Locator;
  joinExistingMeetingButton: Locator;
  currentMeetingsHeaderSelector: Locator;
  favoriteMeetingsHeaderSelector: Locator;

  constructor({ page }: { page: Page }) {
    this.page = page;
    this.planNewMeetingButton = this.page.getByRole('link', { name: 'Plan new' });
    this.startNewMeetingButton = this.page.getByRole('link', { name: 'Start new' });
    this.joinExistingMeetingButton = this.page.getByRole('button', { name: 'Join existing' });
    this.currentMeetingsHeaderSelector = this.page.getByText('Current meetings');
    this.favoriteMeetingsHeaderSelector = this.page.getByText('My favorite meetings');
  }

  async navigateToHomePage(): Promise<void> {
    await Promise.all([this.page.goto(process.env.INSTANCE_URL), this.page.waitForLoadState('load')]);
    // for dashboard page to be fully loaded, favorite meeting box should be rendered fully
    await this.currentMeetingsHeaderSelector.waitFor({ timeout: 10_000 });
  }

  async planNewMeeting(): Promise<PlanMeetingPage> {
    await this.planNewMeetingButton.click();
    await this.page.waitForLoadState('load');
    return new PlanMeetingPage({ page: this.page });
  }

  async startAdhocMeeting(): Promise<MeetingInvitationPage> {
    await this.startNewMeetingButton.click();
    await this.page.waitForLoadState('load');
    return new MeetingInvitationPage({ page: this.page });
  }

  async markMeetingAsFavourite(meetingTitle: string): Promise<void> {
    const meetingMenu = await this.getThreeDotMenuOfMeeting(meetingTitle);
    await meetingMenu.waitFor({ timeout: 10_000 });
    await meetingMenu.click();
    const ariaLabel = `Add ${meetingTitle} to favorites`;
    await this.page.getByRole('menuitem', { name: ariaLabel }).click();
    const favoriteMeetingSeletor = await this.getFavouriteMeetingSelector(meetingTitle);
    await favoriteMeetingSeletor.waitFor({ state: 'visible', timeout: 10_000 });
  }

  async getFavouriteMeetingSelector(meetingTitle: string): Promise<Locator> {
    return await this.page.getByRole('link', { name: meetingTitle, exact: true });
  }

  async getStartMeetingButton(meetingTitle: string): Promise<Locator> {
    return await this.page.getByRole('link', { name: 'Start ' + meetingTitle, exact: true }).first();
  }

  async getThreeDotMenuOfMeeting(meetingTitle: string): Promise<Locator> {
    return await this.page
      .getByRole('listitem')
      .filter({ hasText: meetingTitle })
      .getByRole('button', { name: 'More Options' })
      .first();
  }

  async deleteMeeting(meetingTitle: string): Promise<void> {
    const meetingMenu = await this.getThreeDotMenuOfMeeting(meetingTitle);
    await meetingMenu.waitFor({ timeout: 10_000 });
    await meetingMenu.click();
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
      this.page.waitForLoadState('domcontentloaded'),
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
