// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test, expect } from '@playwright/test';

import { closeWebkitPopUp } from '../../helper/webkit';
import { HomePage } from '../../pages/HomePage';
import { PlanMeetingPage } from '../../pages/PlanMeetingPage';

test.beforeEach('Navigate to dashboard', async ({ page, browserName }) => {
  const homePage = new HomePage({ page });
  await homePage.navigateToHomePage();

  // Warning button in safari blocks the selector for creating new meeting
  if (browserName === 'webkit') {
    await closeWebkitPopUp({ page });
  }
});

test.describe('Dashboard_Home', () => {
  test('TC_002_Dashboard_Home_Plan new button', async ({ page }) => {
    const homePage = new HomePage({ page });
    await homePage.navigateToHomePage();
    await homePage.planNewMeetingButton.click();
    const planMeetingPage = new PlanMeetingPage({ page });

    // title text should be participant and participants
    await expect(planMeetingPage.meetingTextAsTitle).toBeVisible();
    await expect(planMeetingPage.participantTextAsTitle).toBeVisible();
    await expect(planMeetingPage.meetingPageDescription).toBeVisible();
    await expect(planMeetingPage.titleInputField).toBeVisible();
    await expect(planMeetingPage.meetingDetailsInputField).toBeVisible();
    await expect(planMeetingPage.passwordInputField).toBeVisible();
    await expect(planMeetingPage.setDateTimeToggleButton).toBeChecked();
    await expect(planMeetingPage.dateInputField.fromInputField).toBeVisible();
    await expect(planMeetingPage.dateInputField.toInputField).toBeVisible();
    await expect(planMeetingPage.meetingOccurrenceDropDown).toBeVisible();
    await expect(planMeetingPage.meetingOccurrenceDropDown).toHaveText('No repetition');
    await expect(planMeetingPage.waitingRoomToggleButton).not.toBeChecked();
    await expect(planMeetingPage.createSharedFolderToggleButton).not.toBeChecked();
    await expect(planMeetingPage.showMeetingDetailsToggleButton).toBeChecked();
    await expect(planMeetingPage.livestreamToggleButton).not.toBeChecked();
    // enable protection is only available in testing domain and not in CI
    const baseUrl = process.env.INSTANCE_URL;
    const parsedBaseUrl = new URL(baseUrl);
    if (parsedBaseUrl.hostname.startsWith('testing')) {
      await expect(planMeetingPage.enableProtectionToggleButton).not.toBeChecked();
    }
    await expect(planMeetingPage.createMeetingButton).toBeVisible();
    await expect(planMeetingPage.cancelMeetingCreationButton).toBeVisible();
  });

  test('TC_003_Dashboard_Home_Plan new_Step-1 Meeting_Textboxes: Title *, Details, Password', async ({ page }) => {
    const homePage = new HomePage({ page });
    await homePage.planNewMeetingButton.click();
    const planMeetingPage = new PlanMeetingPage({ page });
    await planMeetingPage.titleInputField.click();
    await expect(planMeetingPage.titleInputField).toHaveAttribute('placeHolder', 'My new Meeting');

    const meetingTitle = 'test-meeting';
    await planMeetingPage.titleInputField.fill(meetingTitle);
    await expect(planMeetingPage.titleInputField).toHaveValue(meetingTitle);

    await planMeetingPage.meetingDetailsInputField.click();
    await expect(planMeetingPage.meetingDetailsInputField).toHaveAttribute(
      'placeHolder',
      'What is your meeting about?'
    );

    const meetingDetail = 'This is a test meeting';
    await planMeetingPage.meetingDetailsInputField.fill(meetingDetail);
    await expect(planMeetingPage.meetingDetailsInputField).toHaveValue(meetingDetail);

    await planMeetingPage.passwordInputField.click();
    await expect(planMeetingPage.passwordInputField).toHaveAttribute(
      'placeHolder',
      'Strong password has at least 8 characters'
    );

    const meetingPassword = 'test@1234';
    await planMeetingPage.passwordInputField.fill(meetingPassword);
    await expect(planMeetingPage.passwordInputField).toHaveValue(meetingPassword);
  });
});
