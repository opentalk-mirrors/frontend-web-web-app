// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test, expect } from '@playwright/test';
import { validate } from 'uuid';

import { formatDate } from '../../helper/helper';
import { closeWebkitPopUp } from '../../helper/webkit';
import { HomePage } from '../../pages/HomePage';

const isRoomIdValid = (url: string): boolean => {
  const meetingRoomUrl = new URL(url);
  const splitPath = meetingRoomUrl.pathname.split('/');

  const roomId = splitPath[splitPath.length - 1];
  return splitPath.includes('room') && validate(roomId);
};

const getUserToInviteInMeeting = (browserName: 'chromium' | 'firefox' | 'webkit'): string => {
  const parsedBaseUrl = new URL(process.env.INSTANCE_URL);
  let inviteUser;
  if (parsedBaseUrl.hostname === 'localhost') {
    inviteUser = 'Alice Adams';
  } else if (parsedBaseUrl.hostname.startsWith('testing')) {
    // for testing setup
    inviteUser = 'Time Limit';
  } else {
    // for ci setup
    inviteUser = 'test-firefox test-firefox';
    if (browserName === 'firefox') {
      inviteUser = 'test-webkit test-webkit';
    }
  }
  return inviteUser;
};

test.beforeEach('Navigate to dashboard', async ({ page, browserName }) => {
  const homePage = new HomePage({ page });
  await homePage.navigateToHomePage();

  // Warning button in safari blocks the selector for creating new meeting
  if (browserName === 'webkit') {
    await closeWebkitPopUp({ page });
  }
});

test.describe('Dashboard_Home', () => {
  test('TC_001_Dashboard_Home_Start new', async ({ page, browserName }) => {
    const homePage = new HomePage({ page });
    await homePage.navigateToHomePage();
    const meetingInvitationPage = await homePage.startAdhocMeeting();
    await meetingInvitationPage.waitForGuestLinkToRender();

    await expect(await meetingInvitationPage.getAdhocMeetingDescriptionTitleText()).toBeVisible();
    await expect(await meetingInvitationPage.getAdhocMeetingDescriptionDisclaimer()).toBeVisible();
    await expect(meetingInvitationPage.meetingLinkInputField).toBeVisible();
    await expect(meetingInvitationPage.phoneDialInInputField).toBeVisible();
    await expect(meetingInvitationPage.guestLinkInputField).toBeVisible();
    await expect(meetingInvitationPage.passwordInputField).toBeVisible();
    await expect(meetingInvitationPage.inviteParticipantsInputField).toBeVisible();
    await expect(meetingInvitationPage.cancelMeetingButton).toBeVisible();
    await expect(meetingInvitationPage.openMeetingRoomButton).toBeVisible();
    await expect(meetingInvitationPage.sendInvitationButton).toBeVisible();
    await expect(meetingInvitationPage.sendInvitationButton).toBeDisabled();

    const meetingLink = await meetingInvitationPage.meetingLinkInputField.inputValue();
    expect(isRoomIdValid(meetingLink)).toBeTruthy();
    const guestInvitationLink = await meetingInvitationPage.guestLinkInputField.inputValue();
    expect(isRoomIdValid(guestInvitationLink)).toBeTruthy();

    const phoneNumber = await meetingInvitationPage.phoneDialInInputField.inputValue();
    // default phone number depends on configuration
    // therefore only check if that field is not empty
    expect(phoneNumber).not.toBe('');
    const passwordField = await meetingInvitationPage.passwordInputField.inputValue();
    expect(passwordField).toEqual('-');

    expect(await meetingInvitationPage.getInviteParticipantMeetingLinkPlaceHolderText()).toBe(
      'Type name or email address ( min. 3 characters )'
    );
    await meetingInvitationPage.fillUserDetailForMeetingInvitation('nonexistentuser');
    await expect(await meetingInvitationPage.getUserFromUserInvitationDropDown()).toBe('No result');
    const invitedUser = getUserToInviteInMeeting(browserName);
    await meetingInvitationPage.fillUserDetailForMeetingInvitation(invitedUser);
    await expect(await meetingInvitationPage.getUserFromUserInvitationDropDown()).toBe(invitedUser);

    await meetingInvitationPage.selectUserFromInvitationDropDownToInviteToMeeting();
    await expect(await meetingInvitationPage.getInvitedParticipant(invitedUser)).toBeVisible();
    await expect(meetingInvitationPage.sendInvitationButton).toBeEnabled();

    await meetingInvitationPage.sendMeetingInvitation();
    await expect(await meetingInvitationPage.getNotificationTextAfterInvitingUser()).toBeVisible();

    const lobbyRoomPage = await meetingInvitationPage.goToMeetingLobbyPage();
    await expect(lobbyRoomPage.nameInputField).toBeVisible();
    await lobbyRoomPage.page.close();

    await meetingInvitationPage.cancelMeeting();
    await expect(homePage.startNewMeetingButton).toBeVisible();
  });

  test('TC_002_Dashboard_Home_Plan new button', async ({ page }) => {
    const homePage = new HomePage({ page });
    await homePage.navigateToHomePage();
    const meetingPlanningPage = await homePage.planNewMeeting();

    await expect(meetingPlanningPage.meetingTextAsTitle).toBeVisible();
    await expect(meetingPlanningPage.participantTextAsTitle).toBeVisible();
    await expect(meetingPlanningPage.meetingPageDescription).toBeVisible();
    await expect(meetingPlanningPage.titleInputField).toBeVisible();
    await expect(meetingPlanningPage.meetingDetailsInputField).toBeVisible();
    await expect(meetingPlanningPage.passwordInputField).toBeVisible();
    await expect(meetingPlanningPage.setDateTimeToggleButton).toBeChecked();
    await expect(meetingPlanningPage.dateInputField.fromInputField).toBeVisible();
    await expect(meetingPlanningPage.dateInputField.toInputField).toBeVisible();
    await expect(meetingPlanningPage.meetingOccurrenceDropDown).toBeVisible();
    await expect(meetingPlanningPage.meetingOccurrenceDropDown).toHaveText('No repetition');
    await expect(meetingPlanningPage.waitingRoomToggleButton).not.toBeChecked();
    // check skipped because of https://git.opentalk.dev/opentalk/qa/reports/-/issues/397
    // await expect(meetingPlanningPage.createSharedFolderToggleButton).not.toBeChecked();
    await expect(meetingPlanningPage.showMeetingDetailsToggleButton).toBeChecked();
    await expect(meetingPlanningPage.livestreamToggleButton).not.toBeChecked();

    // enable protection is only available in testing domain and not in CI
    const parsedBaseUrl = new URL(process.env.INSTANCE_URL);
    if (parsedBaseUrl.hostname.startsWith('testing')) {
      await expect(meetingPlanningPage.enableProtectionToggleButton).not.toBeChecked();
    }
    await expect(meetingPlanningPage.createMeetingButton).toBeVisible();
    await expect(meetingPlanningPage.cancelMeetingCreationButton).toBeVisible();
  });

  test('TC_003_Dashboard_Home_Plan new_Step-1 Meeting_Textboxes: Title *, Details, Password', async ({ page }) => {
    const meetingTitle = 'test-meeting';
    const meetingDetail = 'This is a test meeting';
    const meetingPassword = 'test@1234';

    const homePage = new HomePage({ page });
    await homePage.navigateToHomePage();
    const meetingPlanningPage = await homePage.planNewMeeting();

    await meetingPlanningPage.selectTitleInputField();
    await expect(meetingPlanningPage.titleInputField).toHaveAttribute('placeHolder', 'My new Meeting');
    await meetingPlanningPage.titleInputField.fill(meetingTitle);
    await expect(meetingPlanningPage.titleInputField).toHaveValue(meetingTitle);

    await meetingPlanningPage.selectMeetingDetailsInputField();
    await expect(meetingPlanningPage.meetingDetailsInputField).toHaveAttribute(
      'placeHolder',
      'What is your meeting about?'
    );
    await meetingPlanningPage.meetingDetailsInputField.fill(meetingDetail);
    await expect(meetingPlanningPage.meetingDetailsInputField).toHaveValue(meetingDetail);

    await meetingPlanningPage.selectPasswordInputField();
    await expect(meetingPlanningPage.passwordInputField).toHaveAttribute(
      'placeHolder',
      'Strong password has at least 8 characters'
    );
    await meetingPlanningPage.passwordInputField.fill(meetingPassword);
    await expect(meetingPlanningPage.passwordInputField).toHaveValue(meetingPassword);
  });

  test('TC_005_Dashboard_Home_Plan new_Step-1 Meeting_Meeting recurrence dropdown field', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName === 'firefox');
    const homePage = new HomePage({ page });
    const planMeetingPage = await homePage.planNewMeeting();

    await expect(planMeetingPage.meetingOccurrenceDropDown).toBeVisible();
    await expect(planMeetingPage.meetingOccurrenceOptions.selectedOption).toHaveText('No repetition');

    await planMeetingPage.clickOnMeetingRepetitionDropDown();
    await expect(planMeetingPage.meetingOccurrenceOptions.noRepetition).toBeVisible();
    await expect(planMeetingPage.meetingOccurrenceOptions.daily).toBeVisible();
    await expect(planMeetingPage.meetingOccurrenceOptions.weekly).toBeVisible();
    await expect(planMeetingPage.meetingOccurrenceOptions.biWeekly).toBeVisible();
    await expect(planMeetingPage.meetingOccurrenceOptions.monthly).toBeVisible();
    await expect(planMeetingPage.meetingOccurrenceOptions.custom).toBeVisible();
    await planMeetingPage.clickOnmeetingOccurrenceOptionsNoRepetition();

    // Select the Daily option available in the dropdown menu
    await planMeetingPage.selectMeetingRepetition('Daily');
    expect(await planMeetingPage.getMeetingOccurrenceDropDownExpansonState()).toBe('false');
    await expect(planMeetingPage.meetingOccurrenceOptions.selectedOption).toHaveText('Daily');

    // Click on the dropdown field and select the Weekly option available in the dropdown menu
    await planMeetingPage.selectMeetingRepetition('Weekly');
    expect(await planMeetingPage.getMeetingOccurrenceDropDownExpansonState()).toBe('false');
    await expect(planMeetingPage.meetingOccurrenceOptions.selectedOption).toHaveText('Weekly');

    // Again click on the dropdown field and select the Bi-Weekly option available in the dropdown menu
    await planMeetingPage.selectMeetingRepetition('Bi-Weekly');
    expect(await planMeetingPage.getMeetingOccurrenceDropDownExpansonState()).toBe('false');
    await expect(planMeetingPage.meetingOccurrenceOptions.selectedOption).toHaveText('Bi-Weekly');

    // Click on the dropdown field and select the Monthly option available in the dropdown menu
    await planMeetingPage.selectMeetingRepetition('Monthly');
    expect(await planMeetingPage.getMeetingOccurrenceDropDownExpansonState()).toBe('false');
    await expect(planMeetingPage.meetingOccurrenceOptions.selectedOption).toHaveText('Monthly');

    // Again click on the dropdown field and select the No repetition option available in the dropdown menu
    await planMeetingPage.selectMeetingRepetition('No repetition');
    expect(await planMeetingPage.getMeetingOccurrenceDropDownExpansonState()).toBe('false');
    await expect(planMeetingPage.meetingOccurrenceOptions.selectedOption).toHaveText('No repetition');

    // Click on the No repetition dropdown field and select the Custom ... option available in the dropdown menu
    await planMeetingPage.selectMeetingRepetition('Custom');
    await expect(planMeetingPage.customMeetingDiaglog).toBeVisible();
    await expect(planMeetingPage.customMeetingRepetition.customMeetingDiaglogTitle).toBeVisible();
    // Description as “Repeat every”
    await expect(planMeetingPage.customMeetingRepetition.repeatEveryLabel).toBeVisible();
    expect(await planMeetingPage.getNumberOfRepetitions()).toBe('1');
    expect(await planMeetingPage.getRepetitionInterval()).toBe('Day');

    await expect(planMeetingPage.customMeetingRepetition.recurrenceEndLabel).toBeVisible();
    await expect(planMeetingPage.customMeetingRepetition.never).toBeChecked();
    await expect(planMeetingPage.customMeetingRepetition.on).not.toBeChecked();

    await expect(planMeetingPage.customMeetingRepetition.cancel).toBeVisible();
    await expect(planMeetingPage.customMeetingRepetition.save).toBeVisible();

    // Click on Save button with default selection of Repeat every 1 Day and Recurrence end Never
    await planMeetingPage.saveCustomMeetingRepetition();

    // Custom meeting repetition dialogue box should be closed
    await expect(planMeetingPage.customMeetingDiaglog).not.toBeVisible();
    await expect(planMeetingPage.meetingOccurrenceOptions.selectedOption).toHaveText('Every day');

    // Open the Custom meeting repetition dialogue again and For Repeat every, choose 1 Week
    await planMeetingPage.selectMeetingRepetition('Custom');
    await planMeetingPage.selectCustomMeetingRepetition('Week');

    // A new field with selectable options M, T, W, T, F, S, S should appear
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    for (const day of days) {
      if (day === 'S' || day === 'T') {
        await expect(page.getByRole('button', { name: day, exact: true })).toHaveCount(2);
      } else {
        await expect(page.getByRole('button', { name: day, exact: true })).toBeVisible();
      }
    }

    const today = new Date().getDay();

    for (const day of ['M', 'W', 'F']) {
      if (day !== days[today]) {
        await page.getByRole('button', { name: day, exact: true }).click();
      }
    }

    // current day will be select by default. so this code makes sure other days except 'M', 'W' and 'F' are not selected.
    if (!['M', 'W', 'F'].includes(days[today])) {
      await page
        .getByRole('button', { name: days[today], exact: true })
        .nth(today === 2 || today === 0 ? 0 : 1)
        .click();
    }

    // Selected specific days (e.g., Monday, Wednesday, Friday) should be highlighted
    for (const day of ['M', 'W', 'F']) {
      expect(
        await page
          .getByRole('button', { name: day, exact: true })
          .getAttribute('class')
          .then((a) => a.split(/\s+/).includes('MuiChip-filled'))
      ).toBe(true);
    }

    await planMeetingPage.saveCustomMeetingRepetition();

    await expect(planMeetingPage.customMeetingDiaglog).not.toBeVisible();

    // Dropdown field name is updated as Every week on Monday, Wednesday, Friday
    await expect(planMeetingPage.meetingOccurrenceOptions.selectedOption).toHaveText(
      'Every week on Monday, Wednesday, Friday'
    );

    // Open the Custom meeting repetition dialogue again and For Repeat every, choose 1 Month
    await planMeetingPage.selectMeetingRepetition('Custom');
    await planMeetingPage.selectCustomMeetingRepetition('Month');

    // A new field with dropdown field Monthly on [X] should appear
    await expect(planMeetingPage.customMeetingRepetition.repeatOn).toBeVisible();
    await expect(planMeetingPage.customMeetingRepetition.repeatOnMonthComboboxLabel).toBeVisible();

    // Click on the dropdown field Monthly on [X]
    await planMeetingPage.clickOnRepeatOnMonthComboboxLabel();

    await expect(planMeetingPage.customMeetingRepetition.repeatOnMonthOption).toBeVisible();
    await expect(planMeetingPage.customMeetingRepetition.repeatOnEveryOption).toBeVisible();

    // Select any value here (Eg: Every month on the [X] day ) and click on Save button
    await planMeetingPage.clickOnRepeatOnEveryOption();
    await planMeetingPage.saveCustomMeetingRepetition();

    // Custom meeting repetition dialogue box should be closed
    expect(await planMeetingPage.getMeetingOccurrenceDropDownExpansonState()).toBe('false');

    // Dropdown field name is updated as Every month on the [X] day
    await expect(planMeetingPage.meetingOccurrenceOptions.selectedOption).toHaveText(/Every month on the \d\w+ \w+/);

    // Open the Custom meeting repetition dialogue again
    // - For Repeat every, choose 1 Year -> and click on Save button
    await planMeetingPage.selectMeetingRepetition('Custom');
    await planMeetingPage.selectCustomMeetingRepetition('Year');
    await planMeetingPage.saveCustomMeetingRepetition();

    // Custom meeting repetition dialogue box should be closed
    expect(await planMeetingPage.getMeetingOccurrenceDropDownExpansonState()).toBe('false');

    // Dropdown field name is updated as Every year
    await expect(planMeetingPage.meetingOccurrenceOptions.selectedOption).toHaveText('Every year');

    // Open the Custom meeting repetition dialogue again and For Repeat every, choose 2 Days
    await planMeetingPage.selectMeetingRepetition('Custom');
    await planMeetingPage.selectCustomMeetingRepetition('Day');
    await planMeetingPage.setRecurrenceAmount('1', '2');

    // Repeat every option should be selected as 2 Days
    await expect(planMeetingPage.meetingOccurrenceOptions.selectedOption).toHaveText('Every 2 days');

    const nextMonthDate = new Date();
    nextMonthDate.setMonth(new Date().getMonth() + 1);

    // Select Recurrence end on a date a month later (either by entering the date into the input field or selecting from the calendar icon)
    await planMeetingPage.selectMeetingRepetition('Custom');
    await planMeetingPage.enableRecurrence();
    const formattedNextMonthDate = formatDate(nextMonthDate);
    await planMeetingPage.customMeetingRepetition.recurrenceEndDate.fill(formattedNextMonthDate);

    // Recurrence end on option should be selected as date a month later
    await expect(planMeetingPage.customMeetingRepetition.recurrenceEndDate).toHaveValue(formattedNextMonthDate);

    await planMeetingPage.saveCustomMeetingRepetition();

    expect(await planMeetingPage.getMeetingOccurrenceDropDownExpansonState()).toBe('false');

    // Dropdown button name is updated as Every 2 days until Month DD, YYYY
    await expect(planMeetingPage.meetingOccurrenceOptions.selectedOption).toHaveText(/Every 2 days until \w+ \d+, \d+/);
  });
});
