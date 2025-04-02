// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Page, Locator } from '@playwright/test';

export class MeetingRoomPage {
  page: Page;

  selectors = {
    viewPopoverMenu: '#view-popover-menu',
    viewPopoverMenuListItem: '#view-popover-menu > li',
    gridViewContainer: 'grid-container',
    speakerViewContainer: 'SpeakerView-Container',
    speakerViewParticipantsThumbsHolder: 'ThumbsHolder',
    speakerWindow: 'SpeakerWindow1',
    participantWindow: 'ParticipantWindow',
    participantName: 'nameTile',
  };

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

  chatButton: Locator;
  messageButton: Locator;
  searchInChatButton: Locator;
  emojiPicker: Locator;
  chatTextField: Locator;
  chatSubmitButton: Locator;

  burgerMenuButton: Locator;
  securityMonitorButton: Locator;

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
      viewAndSortingPopupMenu: this.page.locator(this.selectors.viewPopoverMenu),
      // get by role doesn't work for the menu items because the label is nested in a div and not part of the li element
      gridViewOption: this.page.locator(this.selectors.viewPopoverMenuListItem).nth(0),
      speakerViewOption: this.page.locator(this.selectors.viewPopoverMenuListItem).nth(1),
      fullScreenViewOption: this.page.locator(this.selectors.viewPopoverMenuListItem).nth(2),
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

    this.chatButton = this.page.getByRole('tab', { name: 'Chat' });
    this.peopleButton = this.page.getByRole('tab', { name: 'People' });
    this.messageButton = this.page.getByRole('tab', { name: 'Messages' });
    this.searchInChatButton = this.page.getByLabel('Search in chat');
    this.emojiPicker = this.page.getByRole('button', { name: 'open emoji picker' });
    this.chatTextField = this.page.getByPlaceholder('Type a message');
    this.chatSubmitButton = this.page.getByRole('button', { name: 'submit chat message' });

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
    const participantsThumbs = await this.page.getByTestId(this.selectors.speakerViewParticipantsThumbsHolder);
    const nthParticipantWindow = await participantsThumbs.getByTestId(this.selectors.participantWindow).nth(nth - 1); // minus 1 because nth(0) is the first element
    const nthParticipantName = await nthParticipantWindow.getByTestId(this.selectors.participantName).innerText();
    await nthParticipantWindow.click();
    return nthParticipantName;
  }

  async getPinnedParticipantNameInSpeakerView(): Promise<string> {
    const speakerViewContainer = await this.page
      .getByTestId(this.selectors.speakerWindow)
      .getByTestId(this.selectors.participantWindow);
    return await speakerViewContainer.getByTestId(this.selectors.participantName).innerText();
  }

  async getFirstParticipantNameInSpeakerView(): Promise<string> {
    const participantName = await this.page
      .getByTestId(this.selectors.speakerViewContainer)
      .getByTestId(this.selectors.participantWindow)
      .first()
      .getByTestId(this.selectors.participantName)
      .innerText();
    return participantName;
  }

  async getThumbsNthParticipantNameInSpeakerView(nth: number): Promise<string> {
    const participantName = await this.page
      .getByTestId(this.selectors.speakerViewParticipantsThumbsHolder)
      .getByTestId(this.selectors.participantWindow)
      .nth(nth - 1) // minus 1 because nth(0) is the first element
      .getByTestId(this.selectors.participantName)
      .innerText();
    return participantName;
  }

  async getGridViewNthParticipantWindowAlignment(nth: number): Promise<string> {
    const gridViewParticipantWindowAlignment = await this.viewOptions.gridViewParticipantWindow
      .nth(nth - 1) // minus 1 because nth(0) is the first
      .evaluate((el) => {
        return window.getComputedStyle(el).getPropertyValue('align-items');
      });
    return gridViewParticipantWindowAlignment;
  }

  async getGridViewNthParticipantWindowSize(nth: number): Promise<string> {
    const gridViewParticipantWindowSize = await this.viewOptions.gridViewParticipantWindow
      .nth(nth - 1) // minus 1 because nth(0) is the first
      .evaluate((el) => {
        return window.getComputedStyle(el).getPropertyValue('width'); // only evaluating width, same could be done with height
      });
    return gridViewParticipantWindowSize;
  }

  async renderMeetingRoom() {
    await this.page.waitForLoadState();
    await this.meetingRoomName.waitFor({ state: 'visible' });
  }
}
