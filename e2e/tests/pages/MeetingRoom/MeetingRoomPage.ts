// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Page, Locator, BrowserContext } from '@playwright/test';

import { BurgerMenuPage } from './BurgerMenuPage';
import { MeetingInfoPage } from './MeetingInfoPage';
import { TimerPage } from './ModeratorTools/TimerPage';
import { MoreOptionsPage } from './MoreOptionsPage';
import { ViewOptionsPage } from './ViewOptionsPage';

export class MeetingRoomPage {
  page: Page;
  context: BrowserContext;

  meetingRoomName: Locator;

  meetingInfoButton: Locator;

  public readonly viewOptionsButton: Locator;

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

  participantsAvatar: {
    moderatorAvatar: Locator;
    guestAvatar: Locator;
  };

  chatButton: Locator;
  peopleButton: Locator;
  messagesButton: Locator;
  searchInChatButton: Locator;
  emojiPicker: Locator;
  chatTextField: Locator;
  chatSubmitButton: Locator;

  securityMonitorButton: Locator;

  burgerMenuButton: Locator;

  reportABug: {
    manualGlitchtipPopup: Locator;
    closeButton: Locator;
  };

  keyboardShortcuts: {
    keyboardShortcutsPopup: Locator;
    checkbox: Locator;
    closeButton: Locator;
  };

  private isKeyboardShortcutOn: boolean = true;

  constructor({ page }: { page: Page }) {
    this.page = page;
    this.context = this.page.context();

    this.meetingRoomName = this.page.locator('h1').first();

    this.meetingInfoButton = this.page.getByRole('button', { name: 'Share meeting details' });

    this.viewOptionsButton = this.page.getByRole('button', { name: 'Select view' });

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

    this.videoPreviewName = this.page.getByRole('complementary', { name: 'Tools' }).getByTestId('nameTile');

    this.toolBar = {
      toolBarPanel: this.page.getByTestId('fullscreen').getByLabel('Personal control panel'),
      handRaiseButton: this.page.getByRole('button', { name: 'Raise Your Hand' }),
      turnOnScreenShareButton: this.page.getByRole('button', { name: 'Turn On Screen Share' }),
      microphoneButton: this.page.getByRole('button', { name: 'Turn On Audio', exact: true }),
      microphoneButtonOff: this.page.getByRole('button', { name: 'Turn Off Audio', exact: true }),
      microphoneMoreOptionsMenuButton: this.page.getByRole('button', { name: 'additional options microphone' }),
      videoButton: this.page.getByRole('button', { name: 'Turn On Video', exact: true }),
      videoButtonOff: this.page.getByRole('button', { name: 'Turn Off Video', exact: true }),
      cameraMoreOptionButton: this.page.getByRole('button', { name: 'additional options camera' }),
      moreOptionButton: this.page.getByRole('button', { name: 'More Options' }),
      endMeetingButton: this.page.getByRole('button', { name: 'Leave Call' }),
    };

    this.participantsAvatar = {
      moderatorAvatar: this.page.locator('.MuiBadge-badge:has(svg title:has-text("Moderator"))'),
      guestAvatar: this.page.locator('.MuiBadge-badge:not(:has(svg title:has-text("Moderator")))'),
    };

    this.chatButton = this.page.getByRole('tab', { name: 'Chat' });
    this.peopleButton = this.page.getByRole('tab', { name: 'People' });
    this.messagesButton = this.page.getByRole('tab', { name: 'Messages' });
    this.searchInChatButton = this.page.getByLabel('Search in chat');
    this.emojiPicker = this.page.getByRole('button', { name: 'open emoji picker' });
    this.chatTextField = this.page.getByPlaceholder('Type a message');
    this.chatSubmitButton = this.page.getByRole('button', { name: 'submit chat message' });

    this.securityMonitorButton = this.page.getByRole('button', { name: 'Show security monitor' });

    this.burgerMenuButton = this.page.getByRole('button', { name: 'My meeting', exact: true });

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

  async showMeetingDetails(): Promise<MeetingInfoPage> {
    await this.meetingInfoButton.click();
    const meetingInfoPage = new MeetingInfoPage(this.page);
    await meetingInfoPage.clipBoardButton.waitFor();
    return meetingInfoPage;
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

  // function related to burger menu
  async openBurgerMenu() {
    await this.burgerMenuButton.click();
    const burgerMenuPage = new BurgerMenuPage(this.page);
    await burgerMenuPage.burgerMenuDropdown.waitFor();
    return burgerMenuPage;
  }

  // functions related to keyboard shortcuts
  async closeKeyboardShortcutsPopup() {
    await this.keyboardShortcuts.closeButton.click();
  }

  async useKeyboardShortcut(key: string): Promise<void> {
    const cameraOn: boolean = await this.isCameraOn();
    const audioOn: boolean = await this.isAudioOn();
    const viewOptionsPage: ViewOptionsPage = new ViewOptionsPage({ page: this.page });
    const isFullScreen: boolean = await viewOptionsPage.isFullScreen();

    await this.page.keyboard.press(key);

    if (this.isKeyboardShortcutOn === true) {
      switch (key) {
        case 'v': {
          if (!cameraOn) {
            await this.toolBar.videoButtonOff.waitFor({ timeout: 10_000 });
          } else {
            await this.toolBar.videoButton.waitFor({ timeout: 10_000 });
          }
          break;
        }

        case 'm': {
          if (!audioOn) {
            await this.toolBar.microphoneButtonOff.waitFor();
          } else {
            await this.toolBar.microphoneButton.waitFor();
          }
          break;
        }

        case 'f': {
          if (isFullScreen) {
            await viewOptionsPage.fullScreenView.waitFor({ state: 'hidden' });
          } else {
            await viewOptionsPage.fullScreenView.waitFor({ state: 'visible' });
          }
          break;
        }
      }
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
    this.isKeyboardShortcutOn = await this.keyboardShortcuts.checkbox.isChecked();
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

  // function related to timer
  async startTimerModeratorTool(): Promise<TimerPage> {
    await this.moderationTools.timerButton.click();
    const timerPage = new TimerPage({ page: this.page });
    await timerPage.timerHeading.waitFor();
    return timerPage;
  }

  async selectModeratorToolHome() {
    await this.moderationTools.homeButton.click();
    await this.searchInChatButton.isVisible();
  }

  async hasModerator(): Promise<boolean> {
    return await this.participantsAvatar.moderatorAvatar.isVisible();
  }
}
