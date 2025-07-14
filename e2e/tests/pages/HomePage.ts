// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Page, Locator } from '@playwright/test';

import { MeetingDetailsPage } from './MeetingDetailsPage';
import { MeetingInvitationPage } from './MeetingInvitationPage';
import { MeetingPlanningPage } from './MeetingPlanningPage';

export class HomePage {
  page: Page;
  planNewMeetingButton: Locator;
  startNewMeetingButton: Locator;
  joinExistingMeetingButton: Locator;
  currentMeetingsHeaderSelector: Locator;
  favoriteMeetingsHeaderSelector: Locator;
  startMeetingButtonNamePrefix: string;
  moreOptionsButtonProperties: { role; options };
  detailsMenuItem: Locator;

  constructor({ page }: { page: Page }) {
    this.page = page;
    this.planNewMeetingButton = this.page.getByRole('link', { name: 'Plan new' });
    this.startNewMeetingButton = this.page.getByRole('link', { name: 'Start new' });
    this.joinExistingMeetingButton = this.page.getByRole('button', { name: 'Join existing' });
    this.currentMeetingsHeaderSelector = this.page.getByText('Current meetings');
    this.favoriteMeetingsHeaderSelector = this.page.getByText('My favorite meetings');
    this.startMeetingButtonNamePrefix = 'Start ';
    this.detailsMenuItem = this.page.getByRole('menuitem', { name: 'Details' });
    this.moreOptionsButtonProperties = {
      role: 'button',
      options: { name: 'More Options' },
    };
  }

  async navigateToHomePage(): Promise<void> {
    await Promise.all([
      this.page.goto(process.env.INSTANCE_URL),
      this.page.waitForLoadState('load'),
      this.page.waitForResponse(async (response) => {
        if (
          response.request().url().includes('/events?time_min') &&
          response.request().method() === 'GET' &&
          response.status() === 200
        ) {
          // if the response has some meetings, then also wait till there is at least one
          // meeting rendered on the page
          const meetingCountFromResponse = Object.keys(await response.json()).length;
          if (meetingCountFromResponse > 0) {
            let meetingCountOnPage: number;
            do {
              meetingCountOnPage = await this.page
                .getByRole(this.moreOptionsButtonProperties.role, this.moreOptionsButtonProperties.options)
                .count();
            } while (meetingCountOnPage <= 0);
          }
          return true;
        }
      }),
      this.page.waitForResponse(
        (response) =>
          response.request().url().includes('/events?per_page') &&
          response.request().method() === 'GET' &&
          response.status() === 200
      ),
      this.page.waitForResponse(
        (response) =>
          response.request().url().includes('/tariff') &&
          response.request().method() === 'GET' &&
          response.status() === 200
      ),
      // for dashboard page to be fully loaded, favorite meeting box should be rendered fully
      await this.currentMeetingsHeaderSelector.waitFor({ timeout: 10_000 }),
    ]);
  }

  async planNewMeeting(): Promise<MeetingPlanningPage> {
    await this.planNewMeetingButton.click();
    await this.page.waitForLoadState('load');
    return new MeetingPlanningPage({ page: this.page });
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

  public async getStartMeetingButton(meetingTitle: string): Promise<Locator> {
    return this.page.getByRole('link', { name: this.startMeetingButtonNamePrefix + meetingTitle, exact: true }).first();
  }

  async getThreeDotMenuOfMeeting(meetingTitle: string): Promise<Locator> {
    const listWithMeeting = this.page.getByRole('list').filter({
      has: this.page.getByRole('heading', { name: meetingTitle, exact: true }).first(),
    });

    return listWithMeeting
      .getByRole(this.moreOptionsButtonProperties.role, this.moreOptionsButtonProperties.options)
      .first();
  }

  async showMeetingDetails(meetingTitle: string): Promise<MeetingDetailsPage> {
    const meetingMenu = await this.getThreeDotMenuOfMeeting(meetingTitle);
    await meetingMenu.click();
    await this.detailsMenuItem.click();
    await this.page.waitForLoadState('load');
    return new MeetingDetailsPage({ page: this.page });
  }

  async deleteMeeting(meetingTitle: string): Promise<boolean> {
    const count = await this.getCountOfMeetingsWithTitle(meetingTitle);
    if (count <= 0) {
      // nothing to do
      return false;
    }
    const startMeetingButton = await this.getStartMeetingButton(meetingTitle);
    const meetingLink = await startMeetingButton.getAttribute('href');
    const uniqueMeetingStartButton = this.page.locator(
      '[data-sentry-component="MeetingPopover"] [href*="' + meetingLink + '"]'
    );
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
      // After deletion, wait for the frontend to update the list:
      this.page.waitForResponse(
        (response) =>
          response.request().url().includes('/events?') &&
          response.request().method() === 'GET' &&
          response.status() === 200
      ),
      this.page.waitForLoadState('domcontentloaded'),
    ]);

    let isStartMeetingButtonVisible: boolean;
    do {
      isStartMeetingButtonVisible = await uniqueMeetingStartButton.isVisible();
    } while (isStartMeetingButtonVisible);
    return true;
  }

  async deleteAllCreatedMeetings(meetingTitle: string): Promise<void> {
    // The UI only shows a maximum of four meetings in the dashboard at a time
    // We need to ensure all meetings are deleted if more than four exist
    let count = await this.getCountOfMeetingsWithTitle(meetingTitle);
    while (count > 0) {
      await this.deleteMeeting(meetingTitle);
      count = await this.getCountOfMeetingsWithTitle(meetingTitle);
    }
  }

  private async getCountOfMeetingsWithTitle(meetingTitle: string): Promise<number> {
    const elements = this.page.getByTitle(meetingTitle);
    return await elements.count();
  }
}
