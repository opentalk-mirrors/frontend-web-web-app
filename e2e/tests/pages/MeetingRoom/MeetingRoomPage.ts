// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Page, Locator, BrowserContext } from '@playwright/test';

import { navigateToExternalPage } from '../../helper/externalPageHelper';
import { MoreOptionsPage } from './MoreOptionsPage';

export class MeetingRoomPage {
  page: Page;
  context: BrowserContext;

  meetingRoomName: Locator;

  meetingDetails: {
    infoButton: Locator;
    inviteLinkInputField: Locator;
    dialInNumberInputField: Locator;
    passwordInputField: Locator;
    copyInviteLinkButton: Locator;
    copyDialInNumButton: Locator;
    copyPasswordButton: Locator;
    shareOptions: {
      clipBoardButton: Locator;
      eMailButton: Locator;
    };
    alertPopup: {
      linkCopiedToClipboardPopup: Locator;
      dialInCopiedToClipboardPopup: Locator;
      passwordCopiedToClipboardPopup: Locator;
      detailsCopiedToClipboardPopup: Locator;
    };
  };

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

  talkingStick: {
    startNowButton: Locator;
    talkingStickStartedNotification: Locator;
    yourTurnPopup: Locator;
  };

  timer: {
    timerHeading: Locator;
    duration: {
      durationSelectionButton: Locator;
      sessionDurationPopup: Locator;
      sessionDurationTitle: Locator;
      unlimitedTimeButton: Locator;
      oneMinuteButton: Locator;
      twoMinutesButton: Locator;
      fiveMinutesButton: Locator;
      customDuration: {
        customButton: Locator;
        spinButton: Locator;
      };
      closeButton: Locator;
      saveButton: Locator;
    };
    titleTextbox: Locator;
    participantsReadyCheckbox: Locator;
    createTimer: {
      createTimerButton: Locator;
      tabPanel: {
        tabPanelSection: Locator;
        heading: Locator;
        elapsedTimeLabel: Locator;
        remainingTimeLabel: Locator;
        time: Locator;
        participantsHeading: Locator;
        participantsNotDoneStatus: Locator;
      };
      timerStartedPopup: {
        timerStartedHeading: Locator;
        elapsedTimeLabel: Locator;
        remainingTimeLabel: Locator;
        time: Locator;
        markMeAsDoneButton: Locator;
      };
      stopTimerButton: Locator;
      timerStoppedAlert: Locator;
      timerRanOutAlert: Locator;
    };
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

  debriefingOptions: {
    endOfTheConferenceOption: Locator;
    forModeratorOption: Locator;
    forModeratorAndRegisteredUserOption: Locator;
    debriefingInitAlert: Locator;
  };

  participantsAvatar: {
    moderatorAvatar: Locator;
    guestAvatar: Locator;
  };

  chatButton: Locator;
  peopleButton: Locator;
  messageButton: Locator;
  searchInChatButton: Locator;
  emojiPicker: Locator;
  chatTextField: Locator;
  chatSubmitButton: Locator;

  securityMonitorButton: Locator;

  burgerMenuButton: Locator;
  burgerMenuDropdown: Locator;
  burgerMenuList: {
    accessibilityMenuItem: Locator;
    userManualMenuItem: Locator;
    keyboardShortcutsMenuItem: Locator;
    reportABugMenuItem: Locator;
  };

  reportABug: {
    manualGlitchtipPopup: Locator;
    closeButton: Locator;
  };

  keyboardShortcuts: {
    keyboardShortcutsPopup: Locator;
    checkbox: Locator;
    closeButton: Locator;
  };

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
    this.context = this.page.context();

    this.meetingRoomName = this.page.locator('h1').first();

    this.meetingDetails = {
      infoButton: this.page.getByRole('button', { name: 'Share meeting details' }),
      inviteLinkInputField: this.page.getByRole('textbox', { name: 'Invite Link' }),
      dialInNumberInputField: this.page.getByRole('textbox', { name: 'Dial-in Number' }),
      passwordInputField: this.page.getByRole('textbox', { name: 'Password' }),
      shareOptions: {
        clipBoardButton: this.page.getByRole('button', { name: 'Clipboard' }),
        eMailButton: this.page.getByRole('button', { name: 'E-Mail' }),
      },
      copyInviteLinkButton: this.page.getByRole('button', { name: 'Copy Invite Link for ' }),
      copyDialInNumButton: this.page.getByRole('button', { name: 'Copy Dial-in Number for ' }),
      copyPasswordButton: this.page.getByRole('button', { name: 'Copy Password for ' }),
      alertPopup: {
        linkCopiedToClipboardPopup: this.page.getByText('The link was copied to your clipboard'),
        dialInCopiedToClipboardPopup: this.page.getByText('The telephone dial-in was copied to the clipboard'),
        passwordCopiedToClipboardPopup: this.page.getByText('The password was copied to your clipboard'),
        detailsCopiedToClipboardPopup: this.page.getByText('Details were copied to your clipboard'),
      },
    };

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

    this.talkingStick = {
      startNowButton: this.page.getByRole('button', { name: 'Start now' }),
      talkingStickStartedNotification: this.page.getByText('The Talking Stick is started.', { exact: true }),
      yourTurnPopup: this.page.getByRole('alertdialog', { name: '' }),
    };

    this.timer = {
      timerHeading: this.page.getByRole('heading', { name: 'Timer' }),
      duration: {
        durationSelectionButton: this.page.getByRole('button', { name: 'Duration' }),
        sessionDurationPopup: this.page.getByRole('dialog', { name: 'Session Duration' }),
        sessionDurationTitle: this.page.getByText('Session Duration', { exact: true }),
        unlimitedTimeButton: this.page.getByRole('button', { name: 'Unlimited duration' }),
        oneMinuteButton: this.page.getByRole('button', { name: '1 minute' }),
        twoMinutesButton: this.page.getByRole('button', { name: '2 minutes' }),
        fiveMinutesButton: this.page.getByRole('button', { name: '5 minutes' }),
        customDuration: {
          customButton: this.page.getByRole('button', { name: 'Custom duration' }),
          spinButton: this.page.getByRole('spinbutton'),
        },
        closeButton: this.page.getByRole('button', { name: 'Close' }),
        saveButton: this.page.getByRole('button', { name: 'Save' }),
      },
      titleTextbox: this.page.getByRole('textbox', { name: 'Title' }),
      participantsReadyCheckbox: this.page.getByRole('checkbox', { name: 'Ask participants if they are ready' }),
      createTimer: {
        createTimerButton: this.page.getByRole('button', { name: 'Create Timer' }),
        tabPanel: {
          tabPanelSection: this.page.getByRole('tabpanel', { name: 'Timer' }),
          heading: this.page.getByRole('tabpanel', { name: 'Timer' }).getByRole('heading', { name: 'Timer' }),
          elapsedTimeLabel: this.page
            .getByRole('tabpanel', { name: 'Timer' })
            .getByText('Elapsed time', { exact: true }),
          remainingTimeLabel: this.page
            .getByRole('tabpanel', { name: 'Timer' })
            .getByText('Remaining time', { exact: true }),
          time: this.page.getByRole('tabpanel', { name: 'Timer' }).getByText(/\b\d{1,2}\s*:\s*\d{2}\b/),
          participantsHeading: this.page.getByRole('heading', { name: 'Participants' }),
          participantsNotDoneStatus: this.page
            .getByRole('tabpanel', { name: 'Timer' })
            .getByRole('listitem')
            .filter({ has: this.page.getByRole('img', { name: 'Not done', exact: true }) }),
        },
        timerStartedPopup: {
          timerStartedHeading: this.page.getByRole('heading', { name: 'A timer was started' }),
          elapsedTimeLabel: this.page.getByRole('dialog').getByText('Elapsed time', { exact: true }),
          remainingTimeLabel: this.page.getByRole('dialog').getByText('Remaining time', { exact: true }),
          time: this.page.getByRole('dialog').getByText(/\b\d{1,2}\s*:\s*\d{2}\b/),
          markMeAsDoneButton: this.page.getByRole('button', { name: 'Mark me as done' }),
        },
        stopTimerButton: this.page.getByRole('button', { name: 'Stop timer' }),
        timerStoppedAlert: this.page.getByRole('alert').getByText('The timer was stopped'),
        timerRanOutAlert: this.page.getByRole('alert').getByText('The timer ran out'),
      },
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

    this.debriefingOptions = {
      endOfTheConferenceOption: this.page.getByRole('button', { name: 'End of the conference' }),
      forModeratorOption: this.page.getByRole('button', { name: 'For moderator', exact: true }),
      forModeratorAndRegisteredUserOption: this.page.getByRole('button', {
        name: 'For moderator + registered user',
        exact: true,
      }),
      debriefingInitAlert: this.page.getByText('Debriefing initiated - Waiting room is activated.', { exact: true }),
    };

    this.participantsAvatar = {
      moderatorAvatar: this.page.locator('.MuiBadge-badge:has(svg title:has-text("Moderator"))'),
      guestAvatar: this.page.locator('.MuiBadge-badge:not(:has(svg title:has-text("Moderator")))'),
    };

    this.chatButton = this.page.getByRole('tab', { name: 'Chat' });
    this.peopleButton = this.page.getByRole('tab', { name: 'People' });
    this.messageButton = this.page.getByRole('tab', { name: 'Messages' });
    this.searchInChatButton = this.page.getByLabel('Search in chat');
    this.emojiPicker = this.page.getByRole('button', { name: 'open emoji picker' });
    this.chatTextField = this.page.getByPlaceholder('Type a message');
    this.chatSubmitButton = this.page.getByRole('button', { name: 'submit chat message' });

    this.securityMonitorButton = this.page.getByRole('button', { name: 'Show security monitor' });

    this.burgerMenuButton = this.page.getByRole('button', { name: 'My meeting', exact: true });
    this.burgerMenuDropdown = this.page.getByRole('menu', { name: 'My meeting' });
    this.burgerMenuList = {
      accessibilityMenuItem: this.page.getByRole('menuitem', { name: 'Accessibility Open in new tab' }),
      userManualMenuItem: this.page.getByRole('menuitem', { name: 'User manual Open in new tab' }),
      keyboardShortcutsMenuItem: this.page.getByRole('menuitem', { name: 'Keyboard Shortcuts' }),
      reportABugMenuItem: this.page.getByRole('menuitem', { name: 'Report a bug' }),
    };

    this.reportABug = {
      manualGlitchtipPopup: this.page.getByRole('dialog', { name: "Oh, it looks like we're having issues." }),
      closeButton: this.page.getByRole('button', { name: 'Close dialog' }),
    };

    this.keyboardShortcuts = {
      keyboardShortcutsPopup: this.page.getByRole('dialog', { name: 'Keyboard Shortcuts' }),
      checkbox: this.page.getByRole('checkbox', { name: 'Keyboard Shortcuts' }),
      closeButton: this.page.getByRole('button', { name: 'Close dialog' }),
    };
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

  // functions related to meeting details
  async showMeetingDetails() {
    await this.meetingDetails.infoButton.click();
  }

  async copyInviteLinkToClipboard() {
    await this.meetingDetails.copyInviteLinkButton.click();
  }

  async copyDialInNumberToClipboard() {
    await this.meetingDetails.copyDialInNumButton.click();
  }

  async copyMeetingDetailsToClipboard() {
    await this.meetingDetails.shareOptions.clipBoardButton.click();
  }

  async copyPasswordToClipboard() {
    await this.meetingDetails.copyPasswordButton.click();
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
    return await this.toolBar.microphoneButtonOff.isVisible();
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

  // functions related to burger menu
  async clickOnBurgerMenu() {
    await this.burgerMenuButton.click();
  }

  async gotoUserManual(): Promise<Page> {
    await this.burgerMenuList.userManualMenuItem.click();
    return await navigateToExternalPage(this.context, 'User manual | OpenTalk');
  }

  // functions related to keyboard shortcuts
  async clickOnKeyboardShortcuts() {
    await this.burgerMenuList.keyboardShortcutsMenuItem.click();
  }

  async closeKeyboardShortcutsPopup() {
    await this.keyboardShortcuts.closeButton.click();
  }

  async useKeyboardShortcut(key: string): Promise<void> {
    await this.page.keyboard.press(key);
    if (key === 'v') {
      await this.page.waitForTimeout(5000); // have to wait for longer for turning video on in firefox
    } else {
      await this.page.waitForTimeout(2000);
    }
  }

  async holdToSpeak() {
    await this.page.keyboard.down('Space');
    await this.page.waitForTimeout(2000);
  }

  async releaseHoldToSpeak() {
    await this.page.keyboard.up('Space');
    await this.page.waitForTimeout(2000);
  }

  async deactivateKeyboardShortcuts() {
    await this.keyboardShortcuts.checkbox.setChecked(false);
  }

  // functions related to talking stick
  async clickOnTalkingStick() {
    await this.moderationTools.talkingStickButton.click();
  }

  async clickOnTalkingStickStartNow() {
    await this.talkingStick.startNowButton.click();
  }

  // functions related to report a bug
  async clickOnReportABug() {
    await this.burgerMenuList.reportABugMenuItem.click();
  }

  async closeManualGlitchtipPopup(method: string) {
    switch (method) {
      case 'BTN_x': {
        await this.reportABug.closeButton.click();
        break;
      }

      case 'BTN_esc': {
        await this.pressEscape();
        break;
      }

      case 'outside the window': {
        await this.page.mouse.click(0, 0);
        break;
      }
    }
  }

  async showMoreOptions() {
    await this.toolBar.moreOptionButton.click();
    return new MoreOptionsPage(this.page);
  }

  // utility function
  async pressEscape() {
    await this.page.keyboard.press('Escape');
  }

  // functions related to timer
  async startTimerModeratorTool() {
    await this.moderationTools.timerButton.click();
    await this.timer.timerHeading.waitFor();
  }

  async openDurationSelection() {
    await this.timer.duration.durationSelectionButton.click();
  }

  async closeDurationSelection() {
    await this.timer.duration.closeButton.click();
  }

  async selectUnlimitedTimeOption() {
    await this.timer.duration.unlimitedTimeButton.click();
  }

  async selectOneMinuteOption() {
    await this.timer.duration.oneMinuteButton.click();
  }

  async selectTwoMinutesOption() {
    await this.timer.duration.twoMinutesButton.click();
  }

  async selectFiveMinutesOption() {
    await this.timer.duration.fiveMinutesButton.click();
  }

  async selectCustomDuration() {
    await this.timer.duration.customDuration.customButton.click();
  }

  async isDurationSelected(locator: Locator): Promise<boolean> {
    return await locator.evaluate((element) => element.getAttribute('aria-selected') === 'true');
  }

  async saveSessionDuration() {
    await this.timer.duration.saveButton.click();
  }

  async enterCustomDuration(value?: string) {
    await this.timer.duration.customDuration.spinButton.click();
    if (value) {
      await this.timer.duration.customDuration.spinButton.fill(value);
    }
  }

  async selectTimerTitleInput() {
    await this.timer.titleTextbox.click();
  }

  async enterTimerTitle(title: string) {
    await this.timer.titleTextbox.fill(title);
  }

  async getPlaceholderOfTimerTitleInput(): Promise<string> {
    return (await this.timer.titleTextbox.getAttribute('placeholder'))!;
  }

  async getTimerTitleInputValue(): Promise<string> {
    return await this.timer.titleTextbox.inputValue();
  }

  async createTimer() {
    await this.timer.createTimer.createTimerButton.click();
  }

  getTimerStartedPopup(title: string = 'A timer was started'): Locator {
    return this.page.getByRole('dialog', { name: title });
  }

  getTimerTitle(title: string): Locator {
    return this.page.getByRole('heading', { name: title });
  }

  async getParticipantsNotDoneStatus(): Promise<Locator[]> {
    const notDoneList: Locator[] = [];
    for (const notDoneParticipant of await this.timer.createTimer.tabPanel.participantsNotDoneStatus.all()) {
      if (await notDoneParticipant.isVisible()) {
        notDoneList.push(notDoneParticipant);
      }
    }
    return notDoneList;
  }

  async getTimerTimeInSeconds(locator: Locator): Promise<number> {
    const time = await locator.innerText();
    const min = parseInt(time.split(':')[0]);
    const sec = parseInt(time.split(':')[1]);
    return min * 60 + sec;
  }

  async waitForRemainingTimerTime() {
    const remainingTime = (await this.getTimerTimeInSeconds(this.timer.createTimer.tabPanel.time)) * 1000;
    await this.page.waitForTimeout(remainingTime);
  }

  async stopTimer() {
    await this.timer.createTimer.stopTimerButton.click();
  }

  async isCountingUp(locator: Locator): Promise<boolean> {
    const prevSec = await this.getTimerTimeInSeconds(locator);
    await this.page.waitForTimeout(2000);
    const currentSec = await this.getTimerTimeInSeconds(locator);

    if (currentSec > prevSec) {
      return true;
    }
    return false;
  }

  async toggleAskParticipantsIfReady(value: boolean) {
    await this.timer.participantsReadyCheckbox.setChecked(value);
  }

  async selectModeratorToolHome() {
    await this.moderationTools.homeButton.click();
    await this.searchInChatButton.isVisible();
  }

  async startDebriefingModeratorTool() {
    await this.moderationTools.debriefingButton.click();
  }

  async selectDebriefingOption(debriefingOptionButton: Locator) {
    await debriefingOptionButton.click();
  }

  async hasModerator(): Promise<boolean> {
    return await this.participantsAvatar.moderatorAvatar.isVisible();
  }
}
