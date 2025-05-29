// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test, expect } from '@playwright/test';
import { validate } from 'uuid';

import { closeWebkitPopUp } from '../../helper/webkit';
import { HomePage } from '../../pages/HomePage';

const isRoomIdValid = (url: string): boolean => {
  const meetingRoomUrl = new URL(url);
  const splitPath = meetingRoomUrl.pathname.split('/');

  const roomId = splitPath[splitPath.length - 1];
  return splitPath.includes('room') && validate(roomId);
};

const getUserToInviteInMeeting = (browserName: string): string => {
  const parsedBaseUrl = new URL(process.env.INSTANCE_URL);
  let inviteUser;
  if (parsedBaseUrl.hostname === 'localhost') {
    inviteUser = 'Alice Adams';
  } else if (parsedBaseUrl.hostname.startsWith('testing')) {
    // for testing setup
    inviteUser = 'Time Limit';
  } else {
    // for ci setup
    inviteUser = 'Test Chrome';
    if (browserName !== 'firefox') {
      inviteUser = 'Test Firefox';
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
    await expect(meetingPlanningPage.createSharedFolderToggleButton).not.toBeChecked();
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
});
