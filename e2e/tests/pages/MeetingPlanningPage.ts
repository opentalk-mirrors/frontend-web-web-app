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
    datePicker: Locator;
    calenderIcon: Locator;
    toInputField: Locator;
  };

  datePicker: {
    cancelButton: Locator;
    okButton: Locator;
    previousMonthButton: Locator;
    nextMonthButton: Locator;
    firstDay: Locator;
    pastDateErrorMessage: Locator;
    endBeforeStartDateErrorMessage: Locator;
  };

  meetingOccurrenceOptions: {
    noRepetition: Locator;
    daily: Locator;
    weekly: Locator;
    biWeekly: Locator;
    monthly: Locator;
    custom: Locator;
    selectedOption: Locator;
  };

  customMeetingDiaglog: Locator;

  customMeetingRepetition: {
    customMeetingDiaglogTitle: Locator;
    repeatEveryLabel: Locator;
    recurrenceEndLabel: Locator;
    never: Locator;
    on: Locator;
    cancel: Locator;
    save: Locator;
    day: Locator;
    week: Locator;
    month: Locator;
    year: Locator;
    repeatOn: Locator;
    repeatOnMonthComboboxLabel: Locator;
    repeatOnMonthOption: Locator;
    repeatOnEveryOption: Locator;
    recurrenceEndDate: Locator;
    recurrenceInterval: Locator;
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
    this.meetingOccurrenceDropDown = this.page.getByRole('combobox', { name: 'Meeting Recurrence' });
    this.meetingTextAsTitle = this.page.getByText('meeting', { exact: true });
    this.participantTextAsTitle = this.page.getByText('Participants');
    this.meetingPageDescription = this.page.getByText(
      'Required fields are marked with an asterisk. Please fill them out.'
    );
    this.dateInputField = {
      fromInputField: this.page.getByPlaceholder('MM/DD/YYYY hh:mm').nth(0),
      datePicker: this.page.locator('.MuiPickersPopper-root'),
      toInputField: this.page.getByPlaceholder('MM/DD/YYYY hh:mm').nth(1),
      calenderIcon: this.page.getByRole('button', { name: 'Choose date' }),
    };
    this.datePicker = {
      okButton: page.getByRole('button', { name: 'ok' }),
      cancelButton: page.getByRole('button', { name: 'cancel' }),
      firstDay: this.page.getByRole('gridcell', { name: '1' }),
      nextMonthButton: this.page.getByRole('button', { name: 'Next month' }),
      previousMonthButton: this.page.getByRole('button', { name: 'Previous month' }),
      pastDateErrorMessage: this.page.getByText('Error: The start date must begin in the future'),
      endBeforeStartDateErrorMessage: this.page.getByText("Error: The meeting can't end before it starts"),
    };
    this.meetingOccurrenceOptions = {
      selectedOption: this.page.getByRole('combobox', { name: 'Meeting recurrence' }),
      noRepetition: this.page.getByRole('option', { name: 'No repetition' }),
      daily: this.page.getByRole('option', { name: 'Daily' }),
      weekly: this.page.getByRole('option', { name: 'Weekly', exact: true }),
      biWeekly: this.page.getByRole('option', { name: 'Bi-Weekly' }),
      monthly: this.page.getByRole('option', { name: 'Monthly' }),
      custom: this.page.getByRole('option', { name: 'Custom' }),
    };
    this.customMeetingDiaglog = this.page.getByRole('dialog', { name: 'Custom meeting repetition' });
    this.customMeetingRepetition = {
      customMeetingDiaglogTitle: this.page.getByRole('heading', { name: 'Custom meeting repetition' }),
      repeatEveryLabel: this.page.getByText('Repeat every'),
      recurrenceEndLabel: this.page.getByText('Recurrence end'),
      never: this.page.getByRole('radio', { name: 'Never' }),
      on: this.page.getByRole('radio', { name: 'On' }),
      cancel: this.page.getByRole('button', { name: 'cancel' }),
      save: this.page.getByRole('button', { name: 'Save' }),
      day: this.page.getByRole('option', { name: 'Day' }),
      week: this.page.getByRole('option', { name: 'Week' }),
      month: this.page.getByRole('option', { name: 'Month' }),
      year: this.page.getByRole('option', { name: 'Year' }),
      repeatOn: this.page.getByText('Repeat on'),
      repeatOnMonthComboboxLabel: this.page.locator('//div[contains(text(), "Monthly on ")]'),
      repeatOnMonthOption: this.page.getByRole('option', { name: /Monthly on \d+/ }),
      repeatOnEveryOption: this.page.getByRole('option', { name: /Every month on the \d+\w+ \w+/ }),
      recurrenceEndDate: page.getByRole('textbox', { name: 'MM/DD/YYYY' }),
      recurrenceInterval: this.page.locator('//div[@role="combobox"]').nth(1),
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

  async getNumberOfRepetitions(): Promise<string> {
    return await this.page.locator('//input[@type="number"]').inputValue();
  }

  async getRepetitionInterval(): Promise<string> {
    return await this.customMeetingRepetition.recurrenceInterval.innerText();
  }

  async setRecurrenceAmount(recurrenceAmount: string, newRecurrenceAmount: string): Promise<void> {
    await this.page.locator(`//input[@value="${recurrenceAmount}" and @type='number']`).fill(newRecurrenceAmount);
    await this.saveCustomMeetingRepetition();
  }

  async clickOnMeetingRepetitionDropDown() {
    await this.meetingOccurrenceDropDown.click();
  }

  async selectMeetingRepetition(repetationInterval?: string): Promise<void> {
    await this.meetingOccurrenceDropDown.click();
    switch (repetationInterval) {
      case 'Custom':
        await this.meetingOccurrenceOptions.custom.click();
        break;
      case 'Daily':
        await this.meetingOccurrenceOptions.daily.click();
        break;
      case 'Weekly':
        await this.meetingOccurrenceOptions.weekly.click();
        break;
      case 'Bi-Weekly':
        await this.meetingOccurrenceOptions.biWeekly.click();
        break;
      case 'Monthly':
        await this.meetingOccurrenceOptions.monthly.click();
        break;
      case 'No repetition':
        await this.meetingOccurrenceOptions.noRepetition.click();
        break;
    }
  }

  async selectCustomMeetingRepetition(repetationInterval?: string): Promise<void> {
    await this.customMeetingRepetition.recurrenceInterval.click();
    switch (repetationInterval) {
      case 'Day':
        await this.customMeetingRepetition.day.click();
        break;
      case 'Week':
        await this.customMeetingRepetition.week.click();
        break;
      case 'Month':
        await this.customMeetingRepetition.month.click();
        break;
      case 'Year':
        await this.customMeetingRepetition.year.click();
        break;
    }
  }

  async clickOnmeetingOccurrenceOptionsCustom(): Promise<void> {
    await this.meetingOccurrenceOptions.custom.click();
  }

  async clickOnmeetingOccurrenceOptionsNoRepetition(): Promise<void> {
    await this.meetingOccurrenceOptions.noRepetition.click();
  }

  async saveCustomMeetingRepetition(): Promise<void> {
    await this.customMeetingRepetition.save.click();
  }

  async clickOnRepeatOnMonthComboboxLabel(): Promise<void> {
    await this.customMeetingRepetition.repeatOnMonthComboboxLabel.click();
  }

  async clickOnRepeatOnEveryOption(): Promise<void> {
    await this.customMeetingRepetition.repeatOnEveryOption.click();
  }

  async enableRecurrence(): Promise<void> {
    await this.customMeetingRepetition.on.click();
  }

  async getMeetingOccurrenceDropDownExpansonState(): Promise<string | null> {
    return await this.meetingOccurrenceDropDown.getAttribute('aria-expanded');
  }
}
