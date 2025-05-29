// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Page, Locator } from '@playwright/test';

import { MeetingInvitationPage } from './MeetingInvitationPage';

export class MeetingPlanningPage {
  page: Page;
  titleInputField: Locator;
  meetingDetailsInputField: Locator;
  passwordInputField: Locator;
  createMeetingButton: Locator;
  setDateTimeToggleButton: Locator;
  waitingRoomToggleButton: Locator;
  createSharedFolderToggleButton: Locator;
  showMeetingDetailsToggleButton: Locator;
  livestreamToggleButton: Locator;
  enableProtectionToggleButton: Locator;
  cancelMeetingCreationButton: Locator;
  meetingOccurrenceDropDown: Locator;
  meetingTextAsTitle: Locator;
  participantTextAsTitle: Locator;
  meetingPageDescription: Locator;

  dateInputField: {
    fromInputField: Locator;
    toInputField: Locator;
  };

  constructor({ page }: { page: Page }) {
    this.page = page;
    this.titleInputField = this.page.getByPlaceholder('My new Meeting');
    this.meetingDetailsInputField = this.page.getByPlaceholder('What is your meeting about?');
    this.passwordInputField = this.page.getByPlaceholder('Strong password has at least');
    this.createMeetingButton = this.page.getByRole('button', { name: 'Save' });
    this.setDateTimeToggleButton = this.page.getByLabel('Set date & time');
    this.waitingRoomToggleButton = this.page.getByLabel('Waiting room');
    this.createSharedFolderToggleButton = this.page.getByLabel('Create shared folder');
    this.showMeetingDetailsToggleButton = this.page.getByLabel('Show meeting details');
    this.livestreamToggleButton = this.page.getByLabel('Livestream');
    this.enableProtectionToggleButton = this.page.getByLabel('Enable very high level of protection');
    this.cancelMeetingCreationButton = this.page.getByRole('link', { name: 'Cancel' });
    this.meetingOccurrenceDropDown = this.page.getByRole('combobox', { name: 'meeting recurrence' });
    this.meetingTextAsTitle = this.page.getByText('meeting', { exact: true });
    this.participantTextAsTitle = this.page.getByText('Participants');
    this.meetingPageDescription = this.page.getByText(
      'Required fields are marked with an asterisk. Please fill them out.'
    );
    this.dateInputField = {
      fromInputField: this.page.getByText('from'),
      toInputField: this.page.getByText('to'),
    };
  }

  async createNewMeeting(title: string, password: string): Promise<void> {
    await this.titleInputField.click();
    await this.titleInputField.fill(title);
    await this.passwordInputField.click();
    await this.passwordInputField.fill(password);
    await this.createMeetingButton.click();

    // wait for meeting invitation page to fully render in frontend
    await this.page.waitForLoadState('load');
    const meetingInvitationPage = new MeetingInvitationPage({ page: this.page });
    await meetingInvitationPage.meetingLinkInputField.waitFor({ state: 'visible', timeout: 30_000 });
  }

  async selectTitleInputField(): Promise<void> {
    await this.titleInputField.isVisible();
    await this.titleInputField.click();
  }

  async selectMeetingDetailsInputField(): Promise<void> {
    await this.meetingDetailsInputField.isVisible();
    await this.meetingDetailsInputField.click();
  }

  async selectPasswordInputField(): Promise<void> {
    await this.passwordInputField.isVisible();
    await this.passwordInputField.click();
  }
}
