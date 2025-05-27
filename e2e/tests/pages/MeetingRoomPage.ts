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
    fullScreenView: Locator;
    closeFullScreenButton: Locator;
    activatedCameraFirstSortingOption: Locator;
    moderatorsFirstSortingOption: Locator;
    gridViewContainer: Locator;
    gridViewParticipantWindow: Locator;
    speakerViewContainer: Locator;
  };

  jumpLinks: {
    skipToModerationPanelLink: Locator;
    skipToMyMeetingMenuLink: Locator;
    skipToPersonalControlPanelLink: Locator;
  };

  moderationTools: {
    homeButton: Locator;
    muteParticipantsButton: Locator;
    resetRaisedHandsButton: Locator;
    talkingStickButton: Locator;
    pollButton: Locator;
    votingButton: Locator;
    meetingNotesButton: Locator;
    whiteboardButton: Locator;
    createBreakoutRoomsButton: Locator;
    timerButton: Locator;
    coffeeBreakButton: Locator;
    debriefingButton: Locator;
  };

  videoPreview: Locator;
  videoPreviewName: Locator;

  toolBar: {
    toolBarPanel: Locator;
    handRaiseButton: Locator;
    turnOnScreenShareButton: Locator;
    microphoneButton: Locator;
    microphoneButtonOff: Locator;
    microphoneMoreOptionsMenuButton: Locator;
    videoButton: Locator;
    videoButtonOff: Locator;
    cameraMoreOptionButton: Locator;
    moreOptionButton: Locator;
    endMeetingButton: Locator;
  };

  chatButton: Locator;
  peopleButton: Locator;
  messageButton: Locator;
  searchInChatButton: Locator;
  emojiPicker: Locator;
  chatTextField: Locator;
  chatSubmitButton: Locator;

  burgerMenuButton: Locator;
  securityMonitorButton: Locator;

  selectors = {
    viewPopoverMenu: '#view-popover-menu',
    viewPopoverMenuListItem: '#view-popover-menu > li',
    gridViewContainer: 'grid-container',
    speakerViewContainer: 'SpeakerView-Container',
    speakerViewParticipantsThumbsHolder: 'ThumbsHolder',
    speakerWindow: 'SpeakerWindow1',
    participantWindow: 'ParticipantWindow',
    participantName: 'nameTile',
    fullScreen: 'fullscreen',
  };

  constructor({ page }: { page: Page }) {
    this.page = page;
    this.meetingRoomName = this.page.locator('h1').first();

    this.viewOptions = {
      viewOptionsButton: this.page.getByRole('button', { name: 'Select view' }),
      viewAndSortingPopupMenu: this.page.locator(this.selectors.viewPopoverMenu),
      // get by role doesn't work for the menu items because the label is nested in a div and not part of the li element
      gridViewOption: this.page.locator(this.selectors.viewPopoverMenuListItem).nth(0),
      speakerViewOption: this.page.locator(this.selectors.viewPopoverMenuListItem).nth(1),
      fullScreenViewOption: this.page.locator(this.selectors.viewPopoverMenuListItem).nth(2),
      fullScreenView: this.page.getByTestId(this.selectors.fullScreen),
      closeFullScreenButton: this.page.getByTestId(this.selectors.fullScreen).getByLabel('close fullscreen'),
      activatedCameraFirstSortingOption: this.page.locator(this.selectors.viewPopoverMenuListItem).nth(4),
      moderatorsFirstSortingOption: this.page.locator(this.selectors.viewPopoverMenuListItem).nth(5),
      gridViewContainer: this.page.getByTestId(this.selectors.gridViewContainer),
      gridViewParticipantWindow: this.page.getByTestId(this.selectors.participantWindow),
      speakerViewContainer: this.page.getByTestId(this.selectors.speakerViewContainer),
    };

    this.jumpLinks = {
      skipToModerationPanelLink: this.page.getByRole('link', { name: 'Skip to Moderation panel' }),
      skipToMyMeetingMenuLink: this.page.getByRole('link', { name: 'Skip to My meeting menu' }),
      skipToPersonalControlPanelLink: this.page.getByRole('link', { name: 'Skip to Personal control panel' }),
    };

    this.moderationTools = {
      homeButton: this.page.getByRole('tab', { name: 'Home' }),
      muteParticipantsButton: this.page.getByRole('tab', { name: 'Mute participants' }),
      resetRaisedHandsButton: this.page.getByRole('tab', { name: 'Reset raised hands' }),
      talkingStickButton: this.page.getByRole('tab', { name: 'Talking stick' }),
      pollButton: this.page.getByRole('tab', { name: 'Poll' }),
      votingButton: this.page.getByRole('tab', { name: 'Voting' }),
      meetingNotesButton: this.page.getByRole('tab', { name: 'Meeting notes' }),
      whiteboardButton: this.page.getByRole('tab', { name: 'Whiteboard' }),
      createBreakoutRoomsButton: this.page.getByRole('tab', { name: 'Create Breakout Rooms' }),
      timerButton: this.page.getByRole('tab', { name: 'Timer' }),
      coffeeBreakButton: this.page.getByRole('tab', { name: 'Coffee break' }),
      debriefingButton: this.page.getByRole('tab', { name: 'Debriefing' }),
    };

    this.videoPreview = this.page.getByRole('complementary', { name: 'Tools' }).locator('video');
    // video container that is nested inside 'aside' tag --> complementary is the role of the aside, see https://www.w3.org/TR/html-aria/#docconformance

    this.videoPreviewName = this.page
      .getByRole('complementary', { name: 'Tools' })
      .getByTestId(this.selectors.participantName);

    this.toolBar = {
      toolBarPanel: this.page.getByTestId('fullscreen').getByLabel('Personal control panel'),
      handRaiseButton: this.page.getByRole('button', { name: 'Raise Your Hand' }),
      turnOnScreenShareButton: this.page.getByRole('button', { name: 'Turn On Screen Share' }),
      microphoneButton: this.page.getByRole('button', { name: 'Turn On Audio' }),
      microphoneButtonOff: this.page.getByRole('button', { name: 'Turn Off Audio' }),
      microphoneMoreOptionsMenuButton: this.page.getByRole('button', { name: 'additional options microphone' }),
      videoButton: this.page.getByRole('button', { name: 'Turn On Video' }),
      videoButtonOff: this.page.getByRole('button', { name: 'Turn Off Video' }),
      cameraMoreOptionButton: this.page.getByRole('button', { name: 'additional options camera' }),
      moreOptionButton: this.page.getByRole('button', { name: 'More Options' }),
      endMeetingButton: this.page.getByRole('button', { name: 'Leave Call' }),
    };

    this.chatButton = this.page.getByRole('tab', { name: 'Chat' });
    this.peopleButton = this.page.getByRole('tab', { name: 'People' });
    this.messageButton = this.page.getByRole('tab', { name: 'Messages' });
    this.searchInChatButton = this.page.getByLabel('Search in chat');
    this.emojiPicker = this.page.getByRole('button', { name: 'open emoji picker' });
    this.chatTextField = this.page.getByPlaceholder('Type a message');
    this.chatSubmitButton = this.page.getByRole('button', { name: 'submit chat message' });

    this.burgerMenuButton = this.page.getByRole('button', { name: 'My meeting', exact: true });
    this.securityMonitorButton = this.page.getByRole('button', { name: 'Show security monitor' });
  }

  allocateViewOptionLocatorsBasedOnSetup() {
    // correct differences between test server and local setup
    // constructor allocates locators to the UI version on test server, this function overwrites settings for local setup
    if (process.env.INSTANCE_URL.startsWith('http://')) {
      this.viewOptions.activatedCameraFirstSortingOption = this.page
        .locator(this.selectors.viewPopoverMenuListItem)
        .nth(3);
      this.viewOptions.moderatorsFirstSortingOption = this.page.locator(this.selectors.viewPopoverMenuListItem).nth(4);
    }
  }

  async renderMeetingRoom(): Promise<void> {
    await this.page.waitForLoadState();
    await this.meetingRoomName.waitFor({ state: 'visible' });
  }

  async getMeetingRoomName(): Promise<string> {
    await this.meetingRoomName.waitFor();
    return await this.meetingRoomName.textContent();
  }

  async getUserName(): Promise<string> {
    let userName = '';
    // user name is only visible if camera is turned on
    const initialCameraStatus = await this.isCameraOn();
    if (!initialCameraStatus) {
      await this.turnCameraOn();
    }
    if (await this.videoPreviewName.isVisible()) {
      userName = await this.videoPreviewName.innerText();
    }
    if (!initialCameraStatus) {
      // reset to initial camera status
      await this.turnCameraOff();
    }
    return userName;
  }

  // functions related to view options menu
  async displayViewOptionsMenu(): Promise<void> {
    await this.viewOptions.viewOptionsButton.waitFor();
    await this.viewOptions.viewOptionsButton.click();
    await this.viewOptions.viewAndSortingPopupMenu.waitFor();
    await this.viewOptions.viewAndSortingPopupMenu.isVisible();
  }

  async selectGridViewOption(): Promise<void> {
    await this.viewOptions.gridViewOption.waitFor();
    await this.viewOptions.gridViewOption.click();
  }

  async selectSpeakerViewOption(): Promise<void> {
    await this.viewOptions.speakerViewOption.waitFor();
    await this.viewOptions.speakerViewOption.click();
  }

  async selectFullScreenViewOption(): Promise<void> {
    await this.viewOptions.fullScreenViewOption.waitFor();
    await this.viewOptions.fullScreenViewOption.click();
    await this.page.waitForLoadState();
    await this.page.waitForTimeout(1000); // it seems like there is some lag, without timeout this seems to make CI fail
    await this.viewOptions.fullScreenView.isVisible();
  }

  async selectActivatedCameraFirstSortingOption(): Promise<void> {
    await this.viewOptions.activatedCameraFirstSortingOption.waitFor();
    await this.viewOptions.activatedCameraFirstSortingOption.click();
  }

  async selectModertorsFirstSortingOption(): Promise<void> {
    await this.viewOptions.moderatorsFirstSortingOption.waitFor();
    await this.viewOptions.moderatorsFirstSortingOption.click();
  }

  async hasTickIcon(element: Locator): Promise<boolean> {
    // if menu item has a tick, count should be 1, else 0
    return (await element.locator('div').first().locator('svg').count()) === 1;
  }

  async isFullScreen(): Promise<boolean> {
    return await this.viewOptions.fullScreenView.isVisible();
  }

  async closeFullScreenMode(): Promise<void> {
    await this.viewOptions.closeFullScreenButton.isVisible();
    await this.viewOptions.closeFullScreenButton.click();
    await this.viewOptions.closeFullScreenButton.isHidden();
    await this.viewOptions.fullScreenView.isHidden();
    await this.page.waitForTimeout(1000);
  }

  // toolbar functions
  async isAudioOn(): Promise<boolean> {
    return await this.toolBar.microphoneButtonOff.isVisible();
  }

  async isCameraOn(): Promise<boolean> {
    return await this.videoPreview.isVisible();
  }

  async turnAudioOn(): Promise<boolean> {
    await this.toolBar.microphoneButton.waitFor({ timeout: 10_000 });
    await this.toolBar.microphoneButton.click();
    await this.page.waitForTimeout(1000); // to make sure microphone is really activated
    return await this.toolBar.videoButtonOff.isVisible();
  }

  async turnAudioOff(): Promise<boolean> {
    await this.toolBar.microphoneButtonOff.waitFor({ timeout: 10_000 });
    await this.toolBar.microphoneButtonOff.click();
    await this.page.waitForTimeout(1000); // to make sure microphone is really deactivated
    return await this.toolBar.microphoneButton.isVisible();
  }

  async turnCameraOn(): Promise<boolean> {
    await this.toolBar.videoButton.waitFor({ timeout: 10_000 });
    await this.toolBar.videoButton.click();
    await this.page.waitForTimeout(1000); // to make sure camera is really activated
    // it seems that in firefox, one has to give approval for use of camera (click 'Allow' in corresponding popup)
    return await this.toolBar.videoButtonOff.isVisible();
  }

  async turnCameraOff(): Promise<boolean> {
    await this.toolBar.videoButtonOff.waitFor({ timeout: 10_000 });
    await this.toolBar.videoButtonOff.click();
    await this.page.waitForTimeout(1000); // to make sure camera is really deactivated
    return await this.toolBar.videoButton.isVisible();
  }

  async selectPeopleTab(): Promise<void> {
    await this.peopleButton.waitFor({ timeout: 10_000 });
    await this.peopleButton.click();
  }

  async getNumberOfParticipantsInMeeting(): Promise<number> {
    const numberOfParticipants = (await this.peopleButton.locator('span').first().innerText()).trim();
    // remove brackets and return as type number
    return +numberOfParticipants.slice(1, numberOfParticipants.length - 1);
  }

  // meeting room functions (related to how particpants are displayed)
  async pinNthParticipantInSpeakerView(nth: number): Promise<string> {
    const participantsThumbs = await this.page.getByTestId(this.selectors.speakerViewParticipantsThumbsHolder);
    const nthParticipantWindow = await participantsThumbs.getByTestId(this.selectors.participantWindow).nth(nth - 1); // minus 1 because nth(0) is the first element
    await nthParticipantWindow.click();
    return await this.getNameTileText(nthParticipantWindow);
  }

  async getPinnedParticipantNameInSpeakerView(): Promise<string> {
    const speakerWindow = await this.page
      .getByTestId(this.selectors.speakerWindow)
      .getByTestId(this.selectors.participantWindow);
    return await this.getNameTileText(speakerWindow);
  }

  async getFirstParticipantNameInSpeakerView(): Promise<string> {
    const participantWindow = await this.page
      .getByTestId(this.selectors.speakerViewContainer)
      .getByTestId(this.selectors.participantWindow)
      .first();
    return await this.getNameTileText(participantWindow);
  }

  async getThumbsNthParticipantNameInSpeakerView(nth: number): Promise<string> {
    const participantWindow = await this.page
      .getByTestId(this.selectors.speakerViewParticipantsThumbsHolder)
      .getByTestId(this.selectors.participantWindow)
      .nth(nth - 1); // minus 1 because nth(0) is the first element
    return await this.getNameTileText(participantWindow);
  }

  async getNthParticipantNameInGridView(nth: number): Promise<string> {
    const participantWindow = await this.page
      //.getByTestId(this.selectors.gridViewContainer) // current version on CI doesn't have 'grid-container' test ID
      .getByTestId(this.selectors.participantWindow)
      .nth(nth - 1); // minus 1 because nth(0) is the first element
    return await this.getNameTileText(participantWindow);
  }

  async getNumberOfParticipantWindowsInGridView(): Promise<number> {
    const participantWindows = await this.page
      //.getByTestId(this.selectors.gridViewContainer) // current version on CI doesn't have 'grid-container' test ID
      .getByTestId(this.selectors.participantWindow)
      .all();
    return participantWindows.length;
  }

  async getNameTileText(participantWindow: Locator): Promise<string> {
    const nameTile = await participantWindow.getByTestId(this.selectors.participantName);
    let nameTileText = '';
    if (await nameTile.isVisible()) {
      nameTileText = await nameTile.innerText();
    }
    return nameTileText;
  }

  async isGridViewNthParticipantCameraOn(nth: number): Promise<boolean> {
    const isGridViewParticipantCameraOn = await this.viewOptions.gridViewParticipantWindow
      .nth(nth - 1) // minus 1 because nth(0) is the first
      .locator('video');
    return await isGridViewParticipantCameraOn.isVisible();
  }

  async getGridViewNthParticipantWindowAlignment(nth: number): Promise<string> {
    const gridViewParticipantWindowAlignment = await this.viewOptions.gridViewParticipantWindow
      .nth(nth - 1) // minus 1 because nth(0) is the first
      .evaluate((el) => {
        return window.getComputedStyle(el).getPropertyValue('align-items');
      });
    return gridViewParticipantWindowAlignment;
  }

  async getGridViewNthParticipantWindowSize(nth: number): Promise<number> {
    const gridViewParticipantWindowSize = await this.viewOptions.gridViewParticipantWindow
      .nth(nth - 1) // minus 1 because nth(0) is the first
      .evaluate((el) => {
        return window.getComputedStyle(el).getPropertyValue('width'); // only evaluating width, same could be done with height
      });
    return Math.floor(+gridViewParticipantWindowSize);
  }
}
