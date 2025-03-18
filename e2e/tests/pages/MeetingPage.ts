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
  openMeetingRoomButton: Locator;

  constructor({ page }: { page: Page }) {
    this.page = page;
    this.titleInputField = this.page.getByPlaceholder('My new Meeting');
    this.passwordInputField = this.page.getByPlaceholder('Strong password has at least');
    this.createMeetingButton = this.page.getByRole('button', { name: 'Save' });
    this.enterMeetingLobby = this.page.getByRole('button', { name: 'Enter now' });
    this.meetingLinkInputField = this.page.getByLabel('Meeting-Link');
    this.openMeetingRoomButton = this.page.getByRole('link', { name: 'Open Video Room' });
  }

  async createNewMeeting(title: string, password: string): Promise<void> {
    await this.titleInputField.fill(title);
    await this.passwordInputField.fill(password);
    await this.createMeetingButton.click();
  }

  async goToAdhocMeetingLobby(): Promise<void> {
    const meetingLink = await this.meetingLinkInputField.inputValue();
    const popupPromise = this.page.waitForEvent('popup');
    await this.openMeetingRoomButton.click();
    const meetingRoomLobbyPage = await popupPromise;
    await meetingRoomLobbyPage.waitForLoadState();
    await meetingRoomLobbyPage.close();
    await this.page.goto(meetingLink);
  }

  async goToMeetingLobby(): Promise<Page> {
    const popupPromise = this.page.waitForEvent('popup');
    await this.openMeetingRoomButton.click();
    const moderatorPage = await popupPromise;
    await moderatorPage.waitForLoadState();
    return popupPromise;
  }
}
