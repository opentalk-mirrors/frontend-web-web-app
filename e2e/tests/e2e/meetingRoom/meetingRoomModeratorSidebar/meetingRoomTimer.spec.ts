// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test, expect } from '@playwright/test';

import { joinMeetingRoomAsGuest, startAdhocMeetingAsModerator } from '../../../helper/meetingHelpers';
import { MeetingRoomPage } from '../../../pages/MeetingRoom/MeetingRoomPage';
import { TimerPage } from '../../../pages/MeetingRoom/ModeratorTools/TimerPage';

const timerTitle = 'MyTimer';
const NUMBER_OF_GUESTS = 1;

test.describe('Meeting Room_Timer', () => {
  let meetingRoomPage: MeetingRoomPage,
    guestLink: string,
    guestMeetingRoomPage: MeetingRoomPage,
    meetingParticipantPages: TimerPage[],
    timerPage: TimerPage;

  test.beforeEach(async ({ page, context }) => {
    ({ meetingRoomPage, guestLink } = await startAdhocMeetingAsModerator(page));
    guestMeetingRoomPage = await joinMeetingRoomAsGuest(context, guestLink, 'guest');
    const meetingRoomTimerPage: TimerPage = new TimerPage({ page: meetingRoomPage.page });
    const guestMeetingRoomTimerPage: TimerPage = new TimerPage({ page: guestMeetingRoomPage.page });
    meetingParticipantPages = [meetingRoomTimerPage, guestMeetingRoomTimerPage]; // need to add invitedGuest in future
    await meetingRoomPage.page.bringToFront();
    timerPage = await meetingRoomPage.startTimerModeratorTool();
  });

  test('TC_001_Meeting Room_As Moderator_Timer', async ({ browserName }) => {
    test.skip(browserName === 'webkit');

    await meetingRoomPage.page.bringToFront();
    const timerPage: TimerPage = await meetingRoomPage.startTimerModeratorTool();
    await expect(timerPage.timerHeading).toHaveText('Timer');
    await expect(timerPage.duration.durationSelectionButton).toHaveAccessibleName('Duration 1 minute');
    await expect(timerPage.titleTextbox).toBeVisible();
    await expect(timerPage.participantsReadyCheckbox).toBeChecked();
    await expect(timerPage.createTimer.createTimerButton).toBeVisible();
  });

  test('TC_002_Meeting Room_As Moderator_Timer_Duration_Session Duration', async () => {
    await timerPage.openDurationSelection();
    await expect(timerPage.duration.sessionDurationTitle).toHaveText('Session Duration');
    await expect(timerPage.duration.unlimitedTimeButton).toBeVisible();
    await expect(timerPage.duration.oneMinuteButton).toBeVisible();
    await expect(timerPage.duration.twoMinutesButton).toBeVisible();
    await expect(timerPage.duration.fiveMinutesButton).toBeVisible();
    await expect(timerPage.duration.customDuration.customButton).toBeVisible();
    await expect(timerPage.duration.closeButton).toBeVisible();
    await expect(timerPage.duration.saveButton).toBeVisible();

    const durations = ['unlimited', 'oneMinute', 'twoMinutes', 'fiveMinutes'] as const;
    for (const duration of durations) {
      const { locator, accessibleName } = await timerPage.selectTimerDuration(duration);
      expect(await timerPage.isDurationSelected(locator)).toBeTruthy();

      await timerPage.saveSessionDuration();
      await expect(timerPage.duration.sessionDurationPopup).not.toBeVisible();
      await expect(timerPage.duration.durationSelectionButton).toHaveAccessibleName(accessibleName);

      await timerPage.openDurationSelection();
      await expect(timerPage.duration.sessionDurationPopup).toBeVisible();
    }

    await timerPage.selectCustomDuration();
    expect(await timerPage.isDurationSelected(timerPage.duration.customDuration.customButton)).toBeTruthy();
    await expect(timerPage.duration.customDuration.spinButton).toBeVisible();
    await expect(timerPage.duration.customDuration.spinButton).toHaveValue('1');

    await timerPage.enterCustomDuration();
    await expect(timerPage.duration.customDuration.spinButton).toBeFocused();

    await timerPage.enterCustomDuration('3');
    await timerPage.saveSessionDuration();
    await expect(timerPage.duration.sessionDurationPopup).not.toBeVisible();
    await expect(timerPage.duration.durationSelectionButton).toHaveAccessibleName('Duration 3 minutes');

    await timerPage.openDurationSelection();
    await timerPage.selectTimerDuration('unlimited');
    await timerPage.closeDurationSelection();
    await expect(timerPage.duration.sessionDurationPopup).not.toBeVisible();
    await expect(timerPage.duration.durationSelectionButton).not.toHaveAccessibleName('Duration Unlimited Time');
  });

  test.describe('TC_003_Meeting Room_As Moderator_Timer_Create Timer_with different duration, with Title', () => {
    test('Create Timer (With Unlimited Time)', async ({ browserName }) => {
      test.skip(browserName === 'webkit');

      await timerPage.openDurationSelection();
      const { accessibleName } = await timerPage.selectTimerDuration('unlimited');
      await timerPage.saveSessionDuration();
      await expect(timerPage.duration.sessionDurationPopup).not.toBeVisible();
      await expect(timerPage.duration.durationSelectionButton).toHaveAccessibleName(accessibleName);

      await timerPage.selectTimerTitleInput();
      expect(await timerPage.getPlaceholderOfTimerTitleInput()).toBe('New timer');

      await timerPage.enterTimerTitle(timerTitle);
      expect(await timerPage.getTimerTitleInputValue()).toBe(timerTitle);

      await timerPage.toggleAskParticipantsIfReady(true);
      await expect(timerPage.participantsReadyCheckbox).toBeChecked();

      await timerPage.createNewTimer();
      for (const page of meetingParticipantPages) {
        await page.page.bringToFront();
        await expect(page.getTimerStartedPopup(timerTitle)).toBeVisible();
        await expect(page.createTimer.timerStartedPopup.timerStartedHeading).toHaveText('A timer was started');
        await expect(page.getTimerTitle(timerTitle)).toHaveText(timerTitle);
        await expect(page.createTimer.timerStartedPopup.elapsedTimeLabel).toBeVisible();
        await expect(page.createTimer.timerStartedPopup.time).toBeVisible();
        expect(await page.isCountingUp(timerPage.createTimer.timerStartedPopup.time)).toBeTruthy();
        await expect(page.createTimer.timerStartedPopup.markMeAsDoneButton).toBeVisible();
      }

      await timerPage.page.bringToFront();
      await expect(timerPage.createTimer.tabPanel.heading).toHaveText('Timer');
      await expect(timerPage.createTimer.tabPanel.elapsedTimeLabel).toBeVisible();
      await expect(timerPage.createTimer.tabPanel.time).toBeVisible();
      expect(await timerPage.isCountingUp(timerPage.createTimer.tabPanel.time)).toBeTruthy();
      await expect(timerPage.createTimer.tabPanel.participantsHeading).toBeVisible();
      expect(await timerPage.getParticipantsNotDoneStatus()).toHaveLength(NUMBER_OF_GUESTS);
      await expect(timerPage.createTimer.stopTimerButton).toBeVisible();
      await expect(meetingRoomPage.moderationTools.coffeeBreakButton).toBeDisabled();

      await timerPage.stopTimer();
      for (const page of meetingParticipantPages) {
        await page.page.bringToFront();
        await expect(page.getTimerStartedPopup(timerTitle)).not.toBeVisible();
        await expect(page.createTimer.timerStoppedAlert).toBeVisible();
      }

      await timerPage.page.bringToFront();
      await expect(timerPage.createTimer.createTimerButton).toBeVisible();
      await expect(meetingRoomPage.moderationTools.coffeeBreakButton).toBeEnabled();
    });

    test('Create Timer (With Duration 1min/2min/5min)', async ({ browserName }) => {
      test.skip(browserName === 'webkit');

      await timerPage.openDurationSelection();
      const { accessibleName } = await timerPage.selectTimerDuration('oneMinute');
      await timerPage.saveSessionDuration();
      await expect(timerPage.duration.sessionDurationPopup).not.toBeVisible();
      await expect(timerPage.duration.durationSelectionButton).toHaveAccessibleName(accessibleName);

      await timerPage.selectTimerTitleInput();
      expect(await timerPage.getPlaceholderOfTimerTitleInput()).toBe('New timer');

      await timerPage.enterTimerTitle(timerTitle);
      expect(await timerPage.getTimerTitleInputValue()).toBe(timerTitle);

      await timerPage.toggleAskParticipantsIfReady(true);
      await expect(timerPage.participantsReadyCheckbox).toBeChecked();

      await timerPage.createNewTimer();
      for (const page of meetingParticipantPages) {
        await page.page.bringToFront();
        await expect(page.getTimerStartedPopup(timerTitle)).toBeVisible();
        await expect(page.createTimer.timerStartedPopup.timerStartedHeading).toHaveText('A timer was started');
        await expect(page.getTimerTitle(timerTitle)).toHaveText(timerTitle);
        await expect(page.createTimer.timerStartedPopup.remainingTimeLabel).toBeVisible();
        await expect(page.createTimer.timerStartedPopup.time).toBeVisible();
        expect(await page.isCountingUp(timerPage.createTimer.timerStartedPopup.time)).toBeFalsy();
        await expect(page.createTimer.timerStartedPopup.markMeAsDoneButton).toBeVisible();
      }

      await timerPage.page.bringToFront();
      await expect(timerPage.createTimer.tabPanel.heading).toHaveText('Timer');
      await expect(timerPage.createTimer.tabPanel.remainingTimeLabel).toBeVisible();
      await expect(timerPage.createTimer.tabPanel.time).toBeVisible();
      expect(await timerPage.isCountingUp(timerPage.createTimer.tabPanel.time)).toBeFalsy();
      await expect(timerPage.createTimer.tabPanel.participantsHeading).toBeVisible();
      expect(await timerPage.getParticipantsNotDoneStatus()).toHaveLength(NUMBER_OF_GUESTS);
      await expect(timerPage.createTimer.stopTimerButton).toBeVisible();
      await expect(meetingRoomPage.moderationTools.coffeeBreakButton).toBeDisabled();

      await timerPage.waitForRemainingTimerTime();
      for (const page of meetingParticipantPages) {
        await page.page.bringToFront();
        await expect(page.getTimerStartedPopup(timerTitle)).not.toBeVisible();
        await expect(page.createTimer.timerRanOutAlert).toBeVisible();
      }

      await timerPage.page.bringToFront();
      await expect(timerPage.createTimer.createTimerButton).toBeVisible();
      await expect(meetingRoomPage.moderationTools.coffeeBreakButton).toBeEnabled();
    });

    test('Create Timer (With Duration Custom)', async ({ browserName }) => {
      test.skip(browserName === 'webkit');

      await timerPage.openDurationSelection();
      await timerPage.selectCustomDuration();
      await timerPage.enterCustomDuration('1');
      await timerPage.saveSessionDuration();
      await expect(timerPage.duration.sessionDurationPopup).not.toBeVisible();
      await expect(timerPage.duration.durationSelectionButton).toHaveAccessibleName('Duration 1 minute');

      await timerPage.enterTimerTitle(timerTitle);
      expect(await timerPage.getTimerTitleInputValue()).toBe(timerTitle);

      await timerPage.toggleAskParticipantsIfReady(true);
      await expect(timerPage.participantsReadyCheckbox).toBeChecked();

      await timerPage.createNewTimer();
      for (const page of meetingParticipantPages) {
        await page.page.bringToFront();
        await expect(page.getTimerStartedPopup(timerTitle)).toBeVisible();
        await expect(page.createTimer.timerStartedPopup.timerStartedHeading).toHaveText('A timer was started');
        await expect(page.getTimerTitle(timerTitle)).toHaveText(timerTitle);
        await expect(page.createTimer.timerStartedPopup.remainingTimeLabel).toBeVisible();
        await expect(page.createTimer.timerStartedPopup.time).toBeVisible();
        expect(await page.isCountingUp(timerPage.createTimer.timerStartedPopup.time)).toBeFalsy();
        await expect(page.createTimer.timerStartedPopup.markMeAsDoneButton).toBeVisible();
      }

      await timerPage.page.bringToFront();
      await expect(timerPage.createTimer.tabPanel.heading).toHaveText('Timer');
      await expect(timerPage.createTimer.tabPanel.remainingTimeLabel).toBeVisible();
      await expect(timerPage.createTimer.tabPanel.time).toBeVisible();
      expect(await timerPage.isCountingUp(timerPage.createTimer.tabPanel.time)).toBeFalsy();
      await expect(timerPage.createTimer.tabPanel.participantsHeading).toBeVisible();
      expect(await timerPage.getParticipantsNotDoneStatus()).toHaveLength(NUMBER_OF_GUESTS);
      await expect(timerPage.createTimer.stopTimerButton).toBeVisible();
      await expect(meetingRoomPage.moderationTools.coffeeBreakButton).toBeDisabled();

      await timerPage.waitForRemainingTimerTime();
      for (const page of meetingParticipantPages) {
        await page.page.bringToFront();
        await expect(page.getTimerStartedPopup(timerTitle)).not.toBeVisible();
        await expect(page.createTimer.timerRanOutAlert).toBeVisible();
      }

      await timerPage.page.bringToFront();
      await expect(timerPage.createTimer.createTimerButton).toBeVisible();
      await expect(meetingRoomPage.moderationTools.coffeeBreakButton).toBeEnabled();
    });
  });

  test('TC_004_Meeting Room_As Moderator_Timer_Create Timer_without Title', async ({ browserName }) => {
    test.skip(browserName === 'webkit');

    await timerPage.openDurationSelection();
    await timerPage.selectTimerDuration('oneMinute');
    await timerPage.saveSessionDuration();
    await expect(timerPage.duration.sessionDurationPopup).not.toBeVisible();
    await expect(timerPage.duration.durationSelectionButton).toHaveAccessibleName('Duration 1 minute');

    expect(await timerPage.getTimerTitleInputValue()).toBe('');

    await timerPage.toggleAskParticipantsIfReady(true);
    await expect(timerPage.participantsReadyCheckbox).toBeChecked();

    await timerPage.createNewTimer();
    await expect(timerPage.getTimerStartedPopup()).toBeVisible();
    for (const page of meetingParticipantPages) {
      await page.page.bringToFront();
      await expect(page.createTimer.timerStartedPopup.timerStartedHeading).toHaveText('A timer was started');
      await expect(page.createTimer.timerStartedPopup.remainingTimeLabel).toBeVisible();
      await expect(page.createTimer.timerStartedPopup.time).toBeVisible();
      expect(await page.isCountingUp(page.createTimer.timerStartedPopup.time)).toBeFalsy();
      await expect(page.createTimer.timerStartedPopup.markMeAsDoneButton).toBeVisible();
    }

    await timerPage.page.bringToFront();
    await expect(timerPage.createTimer.tabPanel.heading).toHaveText('Timer');
    await expect(timerPage.createTimer.tabPanel.remainingTimeLabel).toBeVisible();
    await expect(timerPage.createTimer.tabPanel.time).toBeVisible();
    expect(await timerPage.isCountingUp(timerPage.createTimer.tabPanel.time)).toBeFalsy();
    await expect(timerPage.createTimer.tabPanel.participantsHeading).toBeVisible();
    expect(await timerPage.getParticipantsNotDoneStatus()).toHaveLength(NUMBER_OF_GUESTS);
    await expect(timerPage.createTimer.stopTimerButton).toBeVisible();
    await expect(meetingRoomPage.moderationTools.coffeeBreakButton).toBeDisabled();

    await timerPage.waitForRemainingTimerTime();
    for (const page of meetingParticipantPages) {
      await page.page.bringToFront();
      await expect(page.getTimerStartedPopup()).not.toBeVisible();
      await expect(page.createTimer.timerRanOutAlert).toBeVisible();
    }

    await timerPage.page.bringToFront();
    await expect(timerPage.createTimer.createTimerButton).toBeVisible();
    await expect(meetingRoomPage.moderationTools.coffeeBreakButton).toBeEnabled();
  });
});
