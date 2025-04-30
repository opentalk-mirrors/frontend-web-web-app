// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test, expect } from '@playwright/test';
import { validate } from 'uuid';

import { closeWebkitPopUp } from '../../helper/webkit';
import { HomePage } from '../../pages/HomePage';
import { LobbyRoomPage } from '../../pages/LobbyRoomPage';
import { PlanMeetingPage } from '../../pages/PlanMeetingPage';

const isRoomIdValid = (url: string): boolean => {
  const meetingRoomUrl = new URL(url);
  const splitPath = meetingRoomUrl.pathname.split('/');

  const roomId = splitPath[splitPath.length - 1];
  return splitPath.includes('room') && validate(roomId);
};

const getUserToInviteInMeeting = (browserName: string): string => {
  const baseUrl = process.env.INSTANCE_URL;
  const parsedBaseUrl = new URL(baseUrl);
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

    // send invitation is disabled by default
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

    const lobbyRoomPage = new LobbyRoomPage({ page: await meetingInvitationPage.goToMeetingLobby() });
    await expect(lobbyRoomPage.nameInputField).toBeVisible();
    await lobbyRoomPage.page.close();

    await meetingInvitationPage.cancelMeeting();
    await expect(homePage.startNewMeetingButton).toBeVisible();
  });

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
