// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test, expect } from '@playwright/test';

import { joinMeetingRoomWithNGuests, startAdhocMeetingAsModerator } from '../../helper/meetingHelpers';

test.describe('Meeting Room_Timer', () => {
  test('TC_001_Meeting Room_As Moderator_Timer', async ({ page, context, browserName }) => {
    test.skip(browserName === 'webkit');

    const { meetingRoomPage, guestLink } = await startAdhocMeetingAsModerator(page);
    await joinMeetingRoomWithNGuests(page, context, guestLink, 'guest', 2);

    await meetingRoomPage.page.bringToFront();
    await meetingRoomPage.startTimerModeratorTool();
    await expect(meetingRoomPage.timer.timerHeading).toHaveText('Timer');
    await expect(meetingRoomPage.timer.duration.durationSelectionButton).toHaveAccessibleName('Duration 1 minute');
    await expect(meetingRoomPage.timer.titleTextbox).toBeVisible();
    await expect(meetingRoomPage.timer.participantsReadyCheckbox).toBeChecked();
    await expect(meetingRoomPage.timer.createTimerButton).toBeVisible();
  });

  test('TC_002_Meeting Room_As Moderator_Timer_Duration_Session Duration', async ({ page, context, browserName }) => {
    test.skip(browserName === 'webkit');

    const { meetingRoomPage, guestLink } = await startAdhocMeetingAsModerator(page);
    await joinMeetingRoomWithNGuests(page, context, guestLink, 'guest', 2);
    await meetingRoomPage.page.bringToFront();
    await meetingRoomPage.startTimerModeratorTool();

    await meetingRoomPage.openDurationSelection();
    await expect(meetingRoomPage.timer.duration.sessionDurationTitle).toHaveText('Session Duration');
    await expect(meetingRoomPage.timer.duration.unlimitedTimeButton).toBeVisible();
    await expect(meetingRoomPage.timer.duration.oneMinuteButton).toBeVisible();
    await expect(meetingRoomPage.timer.duration.twoMinutesButton).toBeVisible();
    await expect(meetingRoomPage.timer.duration.fiveMinutesButton).toBeVisible();
    await expect(meetingRoomPage.timer.duration.customDuration.customButton).toBeVisible();
    await expect(meetingRoomPage.timer.duration.closeButton).toBeVisible();
    await expect(meetingRoomPage.timer.duration.saveButton).toBeVisible();

    await meetingRoomPage.selectUnlimitedTimeOption();
    expect(await meetingRoomPage.isDurationSelected(meetingRoomPage.timer.duration.unlimitedTimeButton)).toBeTruthy();

    await meetingRoomPage.saveSessionDuration();
    await expect(meetingRoomPage.timer.duration.sessionDurationPopup).not.toBeVisible();
    await expect(meetingRoomPage.timer.duration.durationSelectionButton).toHaveAccessibleName(
      'Duration Unlimited Time'
    );

    await meetingRoomPage.openDurationSelection();
    await expect(meetingRoomPage.timer.duration.sessionDurationPopup).toBeVisible();

    await meetingRoomPage.selectOneMinuteOption();
    expect(await meetingRoomPage.isDurationSelected(meetingRoomPage.timer.duration.oneMinuteButton)).toBeTruthy();
    await meetingRoomPage.saveSessionDuration();
    await expect(meetingRoomPage.timer.duration.sessionDurationPopup).not.toBeVisible();
    await expect(meetingRoomPage.timer.duration.durationSelectionButton).toHaveAccessibleName('Duration 1 minute');

    await meetingRoomPage.openDurationSelection();
    await expect(meetingRoomPage.timer.duration.sessionDurationPopup).toBeVisible();
    await meetingRoomPage.selectTwoMinutesOption();
    expect(await meetingRoomPage.isDurationSelected(meetingRoomPage.timer.duration.twoMinutesButton)).toBeTruthy();
    await meetingRoomPage.saveSessionDuration();
    await expect(meetingRoomPage.timer.duration.sessionDurationPopup).not.toBeVisible();
    await expect(meetingRoomPage.timer.duration.durationSelectionButton).toHaveAccessibleName('Duration 2 minutes');

    await meetingRoomPage.openDurationSelection();
    await expect(meetingRoomPage.timer.duration.sessionDurationPopup).toBeVisible();
    await meetingRoomPage.selectFiveMinutesOption();
    expect(await meetingRoomPage.isDurationSelected(meetingRoomPage.timer.duration.fiveMinutesButton)).toBeTruthy();
    await meetingRoomPage.saveSessionDuration();
    await expect(meetingRoomPage.timer.duration.sessionDurationPopup).not.toBeVisible();
    await expect(meetingRoomPage.timer.duration.durationSelectionButton).toHaveAccessibleName('Duration 5 minutes');

    await meetingRoomPage.openDurationSelection();
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
    await meetingRoomPage.selectUnlimitedTimeOption();
    await meetingRoomPage.closeDurationSelection();
    await expect(meetingRoomPage.timer.duration.sessionDurationPopup).not.toBeVisible();
    await expect(meetingRoomPage.timer.duration.durationSelectionButton).not.toHaveAccessibleName(
      'Duration Unlimited Time'
    );
  });
});
