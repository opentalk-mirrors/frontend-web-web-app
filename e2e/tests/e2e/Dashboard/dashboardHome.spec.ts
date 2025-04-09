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
