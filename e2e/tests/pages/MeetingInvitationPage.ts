// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Page, Locator } from '@playwright/test';

export class MeetingInvitationPage {
  page: Page;
  meetingLinkInputField: Locator;
  phoneDialUpInputField: Locator;
  guestLinkInputField: Locator;
  passwordInputField: Locator;
  inviteParticipantsInputField: Locator;
  cancelMeetingButton: Locator;
  openMeetingRoomButton: Locator;
  warningDialogForDuplicateMeeting: Locator;
  sendInvitationButton: Locator;
  userInvitationDropDown: Locator;

  adhocMeetingDescription = {
    TitleText: 'Who do you want to invite to your meeting?',
    disclaimer:
      'Attention: This is an ad-hoc meeting, it will be automatically deleted after 24h and not shown in the dashboard',
  };

  createMeetingDescription = {
    disclaimer: 'Required fields are marked with an asterisk. Please fill them out.',
  };

  constructor({ page }: { page: Page }) {
    this.page = page;
    this.meetingLinkInputField = this.page.getByLabel('Meeting-Link');
    this.phoneDialUpInputField = this.page.getByLabel('Phone Dial-in');
    this.guestLinkInputField = this.page.getByLabel('Guest-Link');
    this.passwordInputField = this.page.getByLabel('Password', { exact: true });
    this.inviteParticipantsInputField = this.page.locator('[data-testid="SelectParticipants"] input');
    this.cancelMeetingButton = this.page.getByRole('button', { name: 'Cancel' });
    this.openMeetingRoomButton = this.page.getByRole('link', { name: 'Open Video Room' });
    this.warningDialogForDuplicateMeeting = this.page.getByText('Please confirm');
    this.sendInvitationButton = this.page.getByRole('button', { name: 'Send Invitations' });
    this.userInvitationDropDown = this.page.locator('div[role="presentation"]');
  }

  async waitForGuestLinkToRender(): Promise<boolean> {
    // it takes some time for guestlink placeholder to have meeting url
    let guestLink = await this.guestLinkInputField.inputValue();
    let i = 0;
    while (guestLink === '-' && i++ < 10) {
      await this.page.waitForTimeout(500);
      guestLink = await this.guestLinkInputField.inputValue();
    }
    return guestLink != '-';
  }

  async getGuestLink(): Promise<string> {
    let guestLink = '';
    if (await this.waitForGuestLinkToRender()) {
      guestLink = await this.guestLinkInputField.inputValue();
    }
    return guestLink;
  }

  async navigateToMeetingLobby(): Promise<Page> {
    const meetingLink = await this.meetingLinkInputField.inputValue();
    await Promise.all([
      this.page.goto(meetingLink),
      this.page.waitForLoadState('domcontentloaded', { timeout: 10_000 }),
    ]);
    return this.page;
  }

  async goToAdhocMeetingLobbyAsModerator(closeMeetingTab?: boolean): Promise<void> {
    // the optional parameter closes the meeting setup tab, by default it is false, meaning the tab won't be closed
    const meetingLink = await this.meetingLinkInputField.inputValue();
    await this.startAdhocMeetingHelper(closeMeetingTab);
    await this.page.goto(meetingLink);
  }

  async goToMeetingLobby(): Promise<Page> {
    const popupPromise = this.page.waitForEvent('popup');
    await this.openMeetingRoomButton.click();
    const moderatorPage = await popupPromise;
    await moderatorPage.waitForLoadState();
    return popupPromise;
  }

  async startAdhocMeetingHelper(closeTab: boolean): Promise<void> {
    const popupPromise = this.page.waitForEvent('popup');
    await this.openMeetingRoomButton.click();
    const meetingSetupPage = await popupPromise;
    await meetingSetupPage.waitForLoadState('domcontentloaded');
    if (closeTab) {
      await meetingSetupPage.close();
    }
  }
}
