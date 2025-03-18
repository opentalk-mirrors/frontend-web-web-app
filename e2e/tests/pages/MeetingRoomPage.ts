// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Page, Locator } from '@playwright/test';

export class MeetingRoomPage {
  page: Page;
  meetingRoomName: Locator;

  viewOptions: {
    viewOptionsButton: Locator;
    viewAndSortingPopupMenu: Locator;
    gridViewOption: Locator;
    speakerViewOption: Locator;
    fullScreenViewOption: Locator;
    activatedCameraFirstSortingOption: Locator;
    moderatorsFirstSortingOption: Locator;
  };

  constructor({ page }: { page: Page }) {
    this.page = page;
    this.meetingRoomName = this.page.locator('h1').first();

    this.viewOptions = {
      viewOptionsButton: this.page.getByRole('button', { name: 'Select view' }),
      viewAndSortingPopupMenu: this.page.locator('#view-popover-menu'),
      // get by role doesn't work for the menu items because the label is nested in a div and not part of the li element
      gridViewOption: this.page.locator('#view-popover-menu > li').nth(0),
      speakerViewOption: this.page.locator('#view-popover-menu > li').nth(1),
      fullScreenViewOption: this.page.locator('#view-popover-menu > li').nth(2),
      activatedCameraFirstSortingOption: this.page.locator('#view-popover-menu > li').nth(4),
      moderatorsFirstSortingOption: this.page.locator('#view-popover-menu > li').nth(5),
    };
  }

  allocateViewOptionLocatorsBasedOnSetup() {
    // correct differences between test server and local setup
    // constructor allocates locators to the UI version on test server, this function overwrites settings for local setup
    if (process.env.INSTANCE_URL.startsWith('http://')) {
      this.viewOptions.activatedCameraFirstSortingOption = this.page.locator('#view-popover-menu > li').nth(3);
      this.viewOptions.moderatorsFirstSortingOption = this.page.locator('#view-popover-menu > li').nth(4);
    }
  }

  async getMeetingRoomName(): Promise<string> {
    return await this.meetingRoomName.textContent();
  }
}
