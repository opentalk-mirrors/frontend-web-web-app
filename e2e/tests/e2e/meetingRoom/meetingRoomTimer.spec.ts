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
    await expect(meetingRoomPage.timer.durationButton).toHaveAccessibleName('Duration 1 minute');
    await expect(meetingRoomPage.timer.titleTextbox).toBeVisible();
    await expect(meetingRoomPage.timer.participantsReadyCheckbox).toBeChecked();
    await expect(meetingRoomPage.timer.createTimerButton).toBeVisible();
  });
});
