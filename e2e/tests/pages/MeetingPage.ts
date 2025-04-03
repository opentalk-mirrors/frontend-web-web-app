// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Page, Locator } from '@playwright/test';

export class MeetingPage {
  page: Page;
  titleInputField: Locator;
  passwordInputField: Locator;
  createMeetingButton: Locator;
  enterMeetingLobby: Locator;
  meetingLinkInputField: Locator;
  guestLinkInputField: Locator;
  phoneDialInInputField: Locator;
  openMeetingRoomButton: Locator;
  warningDialogForDuplicateMeeting: Locator;

  constructor({ page }: { page: Page }) {
    this.page = page;
    this.titleInputField = this.page.getByPlaceholder('My new Meeting');
    this.passwordInputField = this.page.getByPlaceholder('Strong password has at least');
    this.createMeetingButton = this.page.getByRole('button', { name: 'Save' });
    this.enterMeetingLobby = this.page.getByRole('button', { name: 'Enter now' });
    this.meetingLinkInputField = this.page.getByLabel('Meeting-Link');
    this.guestLinkInputField = this.page.getByLabel('Guest-Link');
    this.openMeetingRoomButton = this.page.getByRole('link', { name: 'Open Video Room' });
    this.warningDialogForDuplicateMeeting = this.page.getByText('Please confirm');
  }

  async createNewMeeting(title: string, password: string): Promise<void> {
    await this.titleInputField.click();
    await this.titleInputField.fill(title);
    await this.passwordInputField.click();
    await this.passwordInputField.fill(password);
    await this.createMeetingButton.click();
    if (await this.warningDialogForDuplicateMeeting.isVisible()) {
      await this.page.getByText('Create', { exact: true }).click();
    }
    // wait for meeting to full render in frontend
    await this.page.waitForSelector('[aria-label="Only for registered users"]', { state: 'visible' });
  }

  async goToAdhocMeetingLobbyAsModerator(closeMeetingTab?: boolean): Promise<void> {
    // the optional parameter closes the meeting setup tab, by default it is false, meaning the tab won't be closed
    const meetingLink = await this.meetingLinkInputField.inputValue();
    await this.startMeetingHelper(closeMeetingTab);
    await this.page.goto(meetingLink);
  }

  async goToAdhocMeetingLobbyAsModeratorAndGetGuestLink(closeMeetingTab?: boolean): Promise<string> {
    const meetingLink = await this.meetingLinkInputField.inputValue();
    // guest link is initially '-' and proper link only gets inserted into input field after a little moment
    // await this.page.waitForTimeout(100);
    let guestLink = await this.guestLinkInputField.inputValue();
    let i = 0;
    while (guestLink === '-' && i++ < 10) {
      await this.page.waitForTimeout(500);
      guestLink = await this.guestLinkInputField.inputValue();
    }
    await this.startMeetingHelper(closeMeetingTab);
    await this.page.goto(meetingLink);
    return guestLink;
  }

  async goToMeetingLobby(): Promise<Page> {
    const popupPromise = this.page.waitForEvent('popup');
    await this.openMeetingRoomButton.click();
    const moderatorPage = await popupPromise;
    await moderatorPage.waitForLoadState();
    return popupPromise;
  }

  async startMeetingHelper(closeTab: boolean): Promise<void> {
    const popupPromise = this.page.waitForEvent('popup');
    await this.openMeetingRoomButton.click();
    const meetingSetupPage = await popupPromise;
    await meetingSetupPage.waitForLoadState();
    if (closeTab) {
      await meetingSetupPage.close();
    }
  }
}
