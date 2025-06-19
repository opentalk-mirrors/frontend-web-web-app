// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test, expect } from '@playwright/test';

import { joinMeetingRoomAsGuest, startAdhocMeetingAsModerator } from '../../../helper/meetingHelpers';
import { MeetingRoomPage } from '../../../pages/MeetingRoom/MeetingRoomPage';

const timerTitle = 'MyTimer';
const NUMBER_OF_GUESTS = 1;

test.describe('Meeting Room_Timer', () => {
  let meetingRoomPage: MeetingRoomPage,
    guestLink: string,
    guestMeetingRoomPage: MeetingRoomPage,
    meetingParticipantPages: MeetingRoomPage[];

  test.beforeEach(async ({ page, context }) => {
    ({ meetingRoomPage, guestLink } = await startAdhocMeetingAsModerator(page));
    guestMeetingRoomPage = await joinMeetingRoomAsGuest(context, guestLink, 'guest');
    meetingParticipantPages = [meetingRoomPage, guestMeetingRoomPage]; // need to add invitedGuest in future
    await meetingRoomPage.page.bringToFront();
    await meetingRoomPage.startTimerModeratorTool();
  });

  test('TC_001_Meeting Room_As Moderator_Timer', async ({ browserName }) => {
    test.skip(browserName === 'webkit');

    await expect(meetingRoomPage.timer.timerHeading).toHaveText('Timer');
    await expect(meetingRoomPage.timer.duration.durationSelectionButton).toHaveAccessibleName('Duration 1 minute');
    await expect(meetingRoomPage.timer.titleTextbox).toBeVisible();
    await expect(meetingRoomPage.timer.participantsReadyCheckbox).toBeChecked();
    await expect(meetingRoomPage.timer.createTimer.createTimerButton).toBeVisible();
  });

  test('TC_002_Meeting Room_As Moderator_Timer_Duration_Session Duration', async () => {
    await meetingRoomPage.openDurationSelection();
    await expect(meetingRoomPage.timer.duration.sessionDurationTitle).toHaveText('Session Duration');
    await expect(meetingRoomPage.timer.duration.unlimitedTimeButton).toBeVisible();
    await expect(meetingRoomPage.timer.duration.oneMinuteButton).toBeVisible();
    await expect(meetingRoomPage.timer.duration.twoMinutesButton).toBeVisible();
    await expect(meetingRoomPage.timer.duration.fiveMinutesButton).toBeVisible();
    await expect(meetingRoomPage.timer.duration.customDuration.customButton).toBeVisible();
    await expect(meetingRoomPage.timer.duration.closeButton).toBeVisible();
    await expect(meetingRoomPage.timer.duration.saveButton).toBeVisible();

    const durations = ['unlimited', 'oneMinute', 'twoMinutes', 'fiveMinutes'] as const;
    for (const duration of durations) {
      const { locator, accessibleName } = await meetingRoomPage.selectTimerDuration(duration);
      expect(await meetingRoomPage.isDurationSelected(locator)).toBeTruthy();

      await meetingRoomPage.saveSessionDuration();
      await expect(meetingRoomPage.timer.duration.sessionDurationPopup).not.toBeVisible();
      await expect(meetingRoomPage.timer.duration.durationSelectionButton).toHaveAccessibleName(accessibleName);

      await meetingRoomPage.openDurationSelection();
      await expect(meetingRoomPage.timer.duration.sessionDurationPopup).toBeVisible();
    }

    await meetingRoomPage.selectCustomDuration();
    expect(
      await meetingRoomPage.isDurationSelected(meetingRoomPage.timer.duration.customDuration.customButton)
    ).toBeTruthy();
    await expect(meetingRoomPage.timer.duration.customDuration.spinButton).toBeVisible();
    await expect(meetingRoomPage.timer.duration.customDuration.spinButton).toHaveValue('1');

    await meetingRoomPage.enterCustomDuration();
    await expect(meetingRoomPage.timer.duration.customDuration.spinButton).toBeFocused();

    await meetingRoomPage.enterCustomDuration('3');
    await meetingRoomPage.saveSessionDuration();
    await expect(meetingRoomPage.timer.duration.sessionDurationPopup).not.toBeVisible();
    await expect(meetingRoomPage.timer.duration.durationSelectionButton).toHaveAccessibleName('Duration 3 minutes');

    await meetingRoomPage.openDurationSelection();
    await meetingRoomPage.selectTimerDuration('unlimited');
    await meetingRoomPage.closeDurationSelection();
    await expect(meetingRoomPage.timer.duration.sessionDurationPopup).not.toBeVisible();
    await expect(meetingRoomPage.timer.duration.durationSelectionButton).not.toHaveAccessibleName(
      'Duration Unlimited Time'
    );
  });

  test.describe('TC_003_Meeting Room_As Moderator_Timer_Create Timer_with different duration, with Title', () => {
    test('Create Timer (With Unlimited Time)', async ({ browserName }) => {
      test.skip(browserName === 'webkit');

      await meetingRoomPage.openDurationSelection();
      const { accessibleName } = await meetingRoomPage.selectTimerDuration('unlimited');
      await meetingRoomPage.saveSessionDuration();
      await expect(meetingRoomPage.timer.duration.sessionDurationPopup).not.toBeVisible();
      await expect(meetingRoomPage.timer.duration.durationSelectionButton).toHaveAccessibleName(accessibleName);

      await meetingRoomPage.selectTimerTitleInput();
      expect(await meetingRoomPage.getPlaceholderOfTimerTitleInput()).toBe('New timer');

      await meetingRoomPage.enterTimerTitle(timerTitle);
      expect(await meetingRoomPage.getTimerTitleInputValue()).toBe(timerTitle);

      await meetingRoomPage.toggleAskParticipantsIfReady(true);
      await expect(meetingRoomPage.timer.participantsReadyCheckbox).toBeChecked();

      await meetingRoomPage.createTimer();
      for (const page of meetingParticipantPages) {
        await page.page.bringToFront();
        await expect(page.getTimerStartedPopup(timerTitle)).toBeVisible();
        await expect(page.timer.createTimer.timerStartedPopup.timerStartedHeading).toHaveText('A timer was started');
        await expect(page.getTimerTitle(timerTitle)).toHaveText(timerTitle);
        await expect(page.timer.createTimer.timerStartedPopup.elapsedTimeLabel).toBeVisible();
        await expect(page.timer.createTimer.timerStartedPopup.time).toBeVisible();
        expect(await page.isCountingUp(meetingRoomPage.timer.createTimer.timerStartedPopup.time)).toBeTruthy();
        await expect(page.timer.createTimer.timerStartedPopup.markMeAsDoneButton).toBeVisible();
      }

      await meetingRoomPage.page.bringToFront();
      await expect(meetingRoomPage.timer.createTimer.tabPanel.heading).toHaveText('Timer');
      await expect(meetingRoomPage.timer.createTimer.tabPanel.elapsedTimeLabel).toBeVisible();
      await expect(meetingRoomPage.timer.createTimer.tabPanel.time).toBeVisible();
      expect(await meetingRoomPage.isCountingUp(meetingRoomPage.timer.createTimer.tabPanel.time)).toBeTruthy();
      await expect(meetingRoomPage.timer.createTimer.tabPanel.participantsHeading).toBeVisible();
      expect(await meetingRoomPage.getParticipantsNotDoneStatus()).toHaveLength(NUMBER_OF_GUESTS);
      await expect(meetingRoomPage.timer.createTimer.stopTimerButton).toBeVisible();
      await expect(meetingRoomPage.moderationTools.coffeeBreakButton).toBeDisabled();

      await meetingRoomPage.stopTimer();
      for (const page of meetingParticipantPages) {
        await page.page.bringToFront();
        await expect(page.getTimerStartedPopup(timerTitle)).not.toBeVisible();
        await expect(page.timer.createTimer.timerStoppedAlert).toBeVisible();
      }

      await meetingRoomPage.page.bringToFront();
      await expect(meetingRoomPage.timer.createTimer.createTimerButton).toBeVisible();
      await expect(meetingRoomPage.moderationTools.coffeeBreakButton).toBeEnabled();
    });

    test('Create Timer (With Duration 1min/2min/5min)', async ({ browserName }) => {
      test.skip(browserName === 'webkit');

      await meetingRoomPage.openDurationSelection();
      const { accessibleName } = await meetingRoomPage.selectTimerDuration('oneMinute');
      await meetingRoomPage.saveSessionDuration();
      await expect(meetingRoomPage.timer.duration.sessionDurationPopup).not.toBeVisible();
      await expect(meetingRoomPage.timer.duration.durationSelectionButton).toHaveAccessibleName(accessibleName);

      await meetingRoomPage.selectTimerTitleInput();
      expect(await meetingRoomPage.getPlaceholderOfTimerTitleInput()).toBe('New timer');

      await meetingRoomPage.enterTimerTitle(timerTitle);
      expect(await meetingRoomPage.getTimerTitleInputValue()).toBe(timerTitle);

      await meetingRoomPage.toggleAskParticipantsIfReady(true);
      await expect(meetingRoomPage.timer.participantsReadyCheckbox).toBeChecked();

      await meetingRoomPage.createTimer();
      for (const page of meetingParticipantPages) {
        await page.page.bringToFront();
        await expect(page.getTimerStartedPopup(timerTitle)).toBeVisible();
        await expect(page.timer.createTimer.timerStartedPopup.timerStartedHeading).toHaveText('A timer was started');
        await expect(page.getTimerTitle(timerTitle)).toHaveText(timerTitle);
        await expect(page.timer.createTimer.timerStartedPopup.remainingTimeLabel).toBeVisible();
        await expect(page.timer.createTimer.timerStartedPopup.time).toBeVisible();
        expect(await page.isCountingUp(meetingRoomPage.timer.createTimer.timerStartedPopup.time)).toBeFalsy();
        await expect(page.timer.createTimer.timerStartedPopup.markMeAsDoneButton).toBeVisible();
      }

      await meetingRoomPage.page.bringToFront();
      await expect(meetingRoomPage.timer.createTimer.tabPanel.heading).toHaveText('Timer');
      await expect(meetingRoomPage.timer.createTimer.tabPanel.remainingTimeLabel).toBeVisible();
      await expect(meetingRoomPage.timer.createTimer.tabPanel.time).toBeVisible();
      expect(await meetingRoomPage.isCountingUp(meetingRoomPage.timer.createTimer.tabPanel.time)).toBeFalsy();
      await expect(meetingRoomPage.timer.createTimer.tabPanel.participantsHeading).toBeVisible();
      expect(await meetingRoomPage.getParticipantsNotDoneStatus()).toHaveLength(NUMBER_OF_GUESTS);
      await expect(meetingRoomPage.timer.createTimer.stopTimerButton).toBeVisible();
      await expect(meetingRoomPage.moderationTools.coffeeBreakButton).toBeDisabled();

      await meetingRoomPage.waitForRemainingTimerTime();
      for (const page of meetingParticipantPages) {
        await page.page.bringToFront();
        await expect(page.getTimerStartedPopup(timerTitle)).not.toBeVisible();
        await expect(page.timer.createTimer.timerRanOutAlert).toBeVisible();
      }

      await meetingRoomPage.page.bringToFront();
      await expect(meetingRoomPage.timer.createTimer.createTimerButton).toBeVisible();
      await expect(meetingRoomPage.moderationTools.coffeeBreakButton).toBeEnabled();
    });

    test('Create Timer (With Duration Custom)', async ({ browserName }) => {
      test.skip(browserName === 'webkit');

      await meetingRoomPage.openDurationSelection();
      await meetingRoomPage.selectCustomDuration();
      await meetingRoomPage.enterCustomDuration('1');
      await meetingRoomPage.saveSessionDuration();
      await expect(meetingRoomPage.timer.duration.sessionDurationPopup).not.toBeVisible();
      await expect(meetingRoomPage.timer.duration.durationSelectionButton).toHaveAccessibleName('Duration 1 minute');

      await meetingRoomPage.enterTimerTitle(timerTitle);
      expect(await meetingRoomPage.getTimerTitleInputValue()).toBe(timerTitle);

      await meetingRoomPage.toggleAskParticipantsIfReady(true);
      await expect(meetingRoomPage.timer.participantsReadyCheckbox).toBeChecked();

      await meetingRoomPage.createTimer();
      for (const page of meetingParticipantPages) {
        await page.page.bringToFront();
        await expect(page.getTimerStartedPopup(timerTitle)).toBeVisible();
        await expect(page.timer.createTimer.timerStartedPopup.timerStartedHeading).toHaveText('A timer was started');
        await expect(page.getTimerTitle(timerTitle)).toHaveText(timerTitle);
        await expect(page.timer.createTimer.timerStartedPopup.remainingTimeLabel).toBeVisible();
        await expect(page.timer.createTimer.timerStartedPopup.time).toBeVisible();
        expect(await page.isCountingUp(meetingRoomPage.timer.createTimer.timerStartedPopup.time)).toBeFalsy();
        await expect(page.timer.createTimer.timerStartedPopup.markMeAsDoneButton).toBeVisible();
      }

      await meetingRoomPage.page.bringToFront();
      await expect(meetingRoomPage.timer.createTimer.tabPanel.heading).toHaveText('Timer');
      await expect(meetingRoomPage.timer.createTimer.tabPanel.remainingTimeLabel).toBeVisible();
      await expect(meetingRoomPage.timer.createTimer.tabPanel.time).toBeVisible();
      expect(await meetingRoomPage.isCountingUp(meetingRoomPage.timer.createTimer.tabPanel.time)).toBeFalsy();
      await expect(meetingRoomPage.timer.createTimer.tabPanel.participantsHeading).toBeVisible();
      expect(await meetingRoomPage.getParticipantsNotDoneStatus()).toHaveLength(NUMBER_OF_GUESTS);
      await expect(meetingRoomPage.timer.createTimer.stopTimerButton).toBeVisible();
      await expect(meetingRoomPage.moderationTools.coffeeBreakButton).toBeDisabled();

      await meetingRoomPage.waitForRemainingTimerTime();
      for (const page of meetingParticipantPages) {
        await page.page.bringToFront();
        await expect(page.getTimerStartedPopup(timerTitle)).not.toBeVisible();
        await expect(page.timer.createTimer.timerRanOutAlert).toBeVisible();
      }

      await meetingRoomPage.page.bringToFront();
      await expect(meetingRoomPage.timer.createTimer.createTimerButton).toBeVisible();
      await expect(meetingRoomPage.moderationTools.coffeeBreakButton).toBeEnabled();
    });
  });

  test('TC_004_Meeting Room_As Moderator_Timer_Create Timer_without Title', async ({ browserName }) => {
    test.skip(browserName === 'webkit');

    await meetingRoomPage.openDurationSelection();
    await meetingRoomPage.selectTimerDuration('oneMinute');
    await meetingRoomPage.saveSessionDuration();
    await expect(meetingRoomPage.timer.duration.sessionDurationPopup).not.toBeVisible();
    await expect(meetingRoomPage.timer.duration.durationSelectionButton).toHaveAccessibleName('Duration 1 minute');

    expect(await meetingRoomPage.getTimerTitleInputValue()).toBe('');

    await meetingRoomPage.toggleAskParticipantsIfReady(true);
    await expect(meetingRoomPage.timer.participantsReadyCheckbox).toBeChecked();

    await meetingRoomPage.createTimer();
    await expect(meetingRoomPage.getTimerStartedPopup()).toBeVisible();
    for (const page of meetingParticipantPages) {
      await page.page.bringToFront();
      await expect(page.timer.createTimer.timerStartedPopup.timerStartedHeading).toHaveText('A timer was started');
      await expect(page.timer.createTimer.timerStartedPopup.remainingTimeLabel).toBeVisible();
      await expect(page.timer.createTimer.timerStartedPopup.time).toBeVisible();
      expect(await page.isCountingUp(page.timer.createTimer.timerStartedPopup.time)).toBeFalsy();
      await expect(page.timer.createTimer.timerStartedPopup.markMeAsDoneButton).toBeVisible();
    }

    await meetingRoomPage.page.bringToFront();
    await expect(meetingRoomPage.timer.createTimer.tabPanel.heading).toHaveText('Timer');
    await expect(meetingRoomPage.timer.createTimer.tabPanel.remainingTimeLabel).toBeVisible();
    await expect(meetingRoomPage.timer.createTimer.tabPanel.time).toBeVisible();
    expect(await meetingRoomPage.isCountingUp(meetingRoomPage.timer.createTimer.tabPanel.time)).toBeFalsy();
    await expect(meetingRoomPage.timer.createTimer.tabPanel.participantsHeading).toBeVisible();
    expect(await meetingRoomPage.getParticipantsNotDoneStatus()).toHaveLength(NUMBER_OF_GUESTS);
    await expect(meetingRoomPage.timer.createTimer.stopTimerButton).toBeVisible();
    await expect(meetingRoomPage.moderationTools.coffeeBreakButton).toBeDisabled();

    await meetingRoomPage.waitForRemainingTimerTime();
    for (const page of meetingParticipantPages) {
      await page.page.bringToFront();
      await expect(page.getTimerStartedPopup()).not.toBeVisible();
      await expect(page.timer.createTimer.timerRanOutAlert).toBeVisible();
    }

    await meetingRoomPage.page.bringToFront();
    await expect(meetingRoomPage.timer.createTimer.createTimerButton).toBeVisible();
    await expect(meetingRoomPage.moderationTools.coffeeBreakButton).toBeEnabled();
  });
});
