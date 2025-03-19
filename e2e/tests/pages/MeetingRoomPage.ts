// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Page, Locator } from '@playwright/test';

export class MeetingRoomPage {
  page: Page;
  meetingRoomName: Locator;

  toolBar: {
    handRaiseButton: Locator;
    turnOnScreenShareButton: Locator;
    microphoneButton: Locator;
    microphoneMoreOptionsMenuButton: Locator;
    videoButton: Locator;
    cameraMoreOptionButton: Locator;
    moreOptionButton: Locator;
    endMeetingButton: Locator;
  };

  peopleButton: Locator;

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

    this.toolBar = {
      handRaiseButton: this.page.getByRole('button', { name: 'Raise Your Hand' }),
      turnOnScreenShareButton: this.page.getByRole('button', { name: 'Turn On Screen Share' }),
      microphoneButton: this.page.getByRole('button', { name: 'Turn On Audio' }),
      microphoneMoreOptionsMenuButton: this.page.getByRole('button', { name: 'additional options microphone' }),
      videoButton: this.page.getByRole('button', { name: 'Turn On Video' }),
      cameraMoreOptionButton: this.page.getByRole('button', { name: 'additional options camera' }),
      moreOptionButton: this.page.getByRole('button', { name: 'More Options' }),
      endMeetingButton: this.page.getByRole('button', { name: 'Leave Call' }),
    };

    this.peopleButton = this.page.getByRole('tab', { name: 'People' });

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

  async hasTickIcon(element: Locator): Promise<boolean> {
    // if menu item has a tick, count should be 1, else 0
    return (await element.locator('div').first().locator('svg').count()) === 1;
  }

  async getNumberOfParticipantsInMeeting(): Promise<number> {
    const numberOfParticipants = (await this.peopleButton.locator('span').first().innerText()).trim();
    // remove brackets and return as type number
    return +numberOfParticipants.slice(1, numberOfParticipants.length - 1);
  }

  async pinNthParticipantInSpeakerView(nth: number): Promise<string> {
    const participantsThumbs = await this.page.getByTestId('ThumbsHolder');
    const nthParticipantWindow = await participantsThumbs.getByTestId('ParticipantWindow').nth(nth - 1); // minus 1 because nth(0) is the first element
    const nthParticipantName = await nthParticipantWindow.getByTestId('nameTile').innerText();
    await nthParticipantWindow.click();
    return nthParticipantName;
  }

  async getPinnedParticipantNameInSpeakerView(): Promise<string> {
    const speakerViewContainer = await this.page.getByTestId('SpeakerWindow1'); //'SpeakerView-Container'
    return await speakerViewContainer.getByTestId('nameTile').innerText();
  }
}
