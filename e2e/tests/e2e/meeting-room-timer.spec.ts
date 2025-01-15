// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test, expect } from '@playwright/test';

const FIXED_TIMER_DURATIONS = ['1 min', '2 min', '5 min'];
const COUNT_TIMEOUT_IN_SECONDS = 5;

interface TimerProperties {
  duration: string;
  title?: string;
  waitForParticipants?: boolean;
}

//Creates an adhoc meeting room and joins it, also returns a link in case we need to join with another user
const openModeratorMeeting = async (page) => {
  await page.goto(`${process.env.INSTANCE_URL}/dashboard`);
  await page.getByRole('link', { name: 'Start new' }).click();
  const meetingLink = await page.getByLabel('Meeting-Link').inputValue();
  const popupPromise = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'Open Video Room' }).click();
  const moderatorPage = await popupPromise;
  await moderatorPage.waitForLoadState();

  //We need to wait for the username to appear here because otherwise the tests will be flaky (see issue #1692)
  await expect(moderatorPage.getByRole('textbox', { name: 'Name' })).toBeVisible();

  await moderatorPage.getByRole('button', { name: 'Enter now' }).click();
  return { moderatorPage, meetingLink };
};

const openParticipantMeeting = async (context, meetingLink) => {
  const participantPage = await context.newPage();
  await participantPage.goto(meetingLink);
  //We need to wait for the username to appear here because otherwise the tests will be flaky (see issue #1692)
  const userInputField = participantPage.getByRole('textbox', { name: 'Name' });
  await expect(userInputField).toBeVisible();
  const participantUserName = (await userInputField.inputValue()) + '1';
  userInputField.fill(participantUserName);

  await participantPage.getByRole('button', { name: 'Enter now' }).click();
  return { participantPage, participantUserName };
};

//Gets the button that opens the set duration UI
const getDurationButton = async (meetingPage) => {
  const minButton = meetingPage.getByRole('button', { name: 'min' });
  const isMinButton = await minButton.isVisible();
  if (isMinButton) {
    return minButton;
  } else {
    return meetingPage.getByRole('button', { name: 'Unlimited Time' });
  }
};

const setTimerDuration = async (meetingPage, duration) => {
  let buttonName = duration;
  const durationButton = await getDurationButton(meetingPage);
  await durationButton.click();
  await meetingPage.getByRole('button', { name: buttonName }).click();
  if (duration === 'Custom') {
    await meetingPage.getByRole('spinbutton').fill('3');
    buttonName = '3 min';
  }
  await meetingPage.getByRole('button', { name: 'Save' }).click();

  await expect(meetingPage.getByRole('button', { name: buttonName })).toBeVisible();
};

const startTimer = async (meetingPage, { title, duration, waitForParticipants }: TimerProperties) => {
  await meetingPage.getByPlaceholder('Title').click();
  if (title) {
    await meetingPage.getByPlaceholder('Title').fill(title);
  }
  if (waitForParticipants === false) {
    const participantsCheckBox = meetingPage.getByLabel('Ask participants if they are');
    await participantsCheckBox.click();
    await expect(participantsCheckBox).not.toBeChecked();
  }
  await setTimerDuration(meetingPage, duration);
  await meetingPage.getByRole('button', { name: 'Create Timer' }).click();
};

const stopTimer = async (page) => {
  await page.getByText('Stop timer').click();
  await expect(page.getByText('The Timer was stopped')).toBeVisible();
  await page.getByRole('alert').getByRole('button').click();
};

const getTimerText = (duration) => (duration === 'Unlimited Time' ? /Elapsed time/ : /Remaining time/);

const checkIfTimerPopupAppeared = async (page, { title, duration, waitForParticipants }: TimerProperties) => {
  await expect(page.getByRole('heading', { name: 'A timer was started' })).toBeVisible();
  if (title) {
    await expect(page.getByRole('heading', { name: title })).toBeVisible();
  }
  await expect(page.locator('_react=TimerDuration').nth(0)).toBeVisible();
  await expect(page.locator('_react=TimerDuration').nth(0)).toHaveText(getTimerText(duration));
  await expect(page.locator('_react=TimerDuration').nth(0)).toHaveText(/\d\d : \d\d/);
  if (waitForParticipants === false) {
    return;
  }
  await expect(page.getByRole('button', { name: 'Mark me as done' })).toBeVisible();
};
const waitForParticipantToJoin = async (page, userName) => {
  // TODO: this is a workaround for issue #1135/#1696
  await page.getByRole('tab', { name: 'People' }).click();
  await page.getByText(userName + 'joined').waitFor();
};
//this check can cause flakiness, we should keep an eye on this
const timerChecks = (page, { duration }: TimerProperties, timerString) => {
  const convertTime = (timeString) => {
    const minuteString = timeString.replace(getTimerText(duration), '').replace(/ : \d\d/, '');
    const secondString = timeString.replace(getTimerText(duration), '').replace(/\d\d : /, '');
    return { minutes: Number(minuteString), seconds: Number(secondString) };
  };
  const zeroPad = (num, places) => String(num).padStart(places, '0');
  const createTimeString = (minutes, seconds): string => {
    return `${getTimerText(duration).source}${zeroPad(minutes, 2)} : ${zeroPad(seconds, 2)}`;
  };

  const { minutes, seconds } = convertTime(timerString);
  const durationMinutes = parseInt(duration === 'Custom' ? '3' : duration);

  const checkIfTimerDurationIsCorrect = async () => {
    if (duration !== 'Unlimited Time') {
      await expect(minutes).toBeLessThanOrEqual(durationMinutes);
    }
  };
  const checkIfTimerCountsCorrectly = async () => {
    const timeout = 1000 + COUNT_TIMEOUT_IN_SECONDS * 1000;
    if (duration === 'Unlimited Time') {
      const countTime = createTimeString(minutes, seconds + COUNT_TIMEOUT_IN_SECONDS);
      await expect(page.locator('_react=TimerDuration').nth(0)).toHaveText(countTime, { timeout });
    } else {
      const countTime =
        seconds === 0
          ? createTimeString(minutes - 1, 60 - COUNT_TIMEOUT_IN_SECONDS)
          : createTimeString(minutes, seconds - COUNT_TIMEOUT_IN_SECONDS);
      await expect(page.locator('_react=TimerDuration').nth(0)).toHaveText(countTime, { timeout });
    }
  };
  return { checkIfTimerDurationIsCorrect, checkIfTimerCountsCorrectly };
};
const checkIfModeratorTimerAppeared = async (page, { duration }: TimerProperties) => {
  await expect(page.locator('#tabpanel-tab-timer').getByText('Timer', { exact: true })).toBeVisible();
  await expect(page.locator('_react=TimerDuration').nth(1)).toBeVisible();
  await expect(page.locator('_react=TimerDuration').nth(1)).toHaveText(getTimerText(duration));
  await expect(page.locator('_react=TimerDuration').nth(1)).toHaveText(/\d\d : \d\d/);
  await expect(page.getByText('Stop timer')).toBeVisible();
};

const checkIfTimerStartedCorrectly = async (page, timerProperties) => {
  await checkIfTimerPopupAppeared(page, timerProperties);
  await checkIfModeratorTimerAppeared(page, timerProperties);
};
const checkParticipantList = async (page, userName) => {
  await expect(page.locator('#tabpanel-tab-timer').getByText(userName, { exact: true })).toBeVisible();
  await expect(page.locator('#tabpanel-tab-timer svg')).toHaveClass(/MuiSvgIcon-colorWarning/);
};
const checkIfParticipantClickedOnDone = async (page) => {
  await expect(page.locator('#tabpanel-tab-timer svg')).toHaveClass(/MuiSvgIcon-colorPrimary/);
};

const checkIfTimerUiElementsAreAtDefaultSetting = async (page) => {
  await expect(page.locator('#tabpanel-tab-timer').getByText('Timer', { exact: true })).toBeVisible();
  await expect(page.getByText('Duration')).toBeVisible();
  await expect(page.getByRole('button', { name: 'min' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'min' })).toHaveText('1 min');
  await expect(page.getByRole('button', { name: 'Create Timer' })).toBeVisible();
  await expect(page.getByPlaceholder('Title')).toBeVisible();
  await expect(page.getByLabel('Ask participants if they are')).toBeVisible();
  await expect(page.getByLabel('Ask participants if they are')).toBeChecked();
};

const waitForTimerToFinish = async (page) => {
  const timerFinishedAlert = page.getByRole('alert').getByText(/timer/);
  await timerFinishedAlert.waitFor({ timeout: 65000 });
};

const checkAlert = async (page, alertMessage) => {
  await expect(page.getByRole('alert').getByText(/timer/)).toHaveText(alertMessage);
  await expect(page.getByRole('alert').getByText(/timer/)).not.toBeVisible({
    timeout: 10000,
  });
};

test.describe.skip('Meeting Room Timer', () => {
  let moderatorMeeting, participantMeeting;

  test.beforeEach(
    'open meeting and join as moderator and participant',
    async ({ page, context, browser }, testInfo) => {
      if (!testInfo.title.includes('#1135')) {
        //#1135 is the only test case where we don't open the browser tabs in this order
        //so we skip it
        moderatorMeeting = await openModeratorMeeting(page);
        const { moderatorPage, meetingLink } = moderatorMeeting;
        participantMeeting = await openParticipantMeeting(context, meetingLink);
        const { participantPage, participantUserName } = participantMeeting;
        if (browser.browserType().name() === 'webkit') {
          await moderatorPage.getByRole('alert').getByText('Ok').click();
          await participantPage.getByRole('alert').getByText('Ok').click();
        }
        await waitForParticipantToJoin(moderatorPage, participantUserName);
        await moderatorPage.getByRole('tab', { name: 'Timer' }).click();
      }
    }
  );
  test.describe('test UI elements', () => {
    test('TC_001_Meeting Room_As Moderator_Timer', async () => {
      //check if UI elements are there and have correct default values
      await checkIfTimerUiElementsAreAtDefaultSetting(moderatorMeeting.moderatorPage);
    });
    test('TC_002_Meeting Room_As Moderator_Timer_Duration field', async () => {
      //check if duration UI elements are correct
      const { moderatorPage } = moderatorMeeting;

      await moderatorPage.getByRole('button', { name: 'min' }).click();
      await expect(moderatorPage.getByText('Session Duration')).toBeVisible();
      await expect(moderatorPage.getByRole('button', { name: 'Unlimited Time' })).toBeVisible();
      await expect(moderatorPage.getByRole('button', { name: '1 min' })).toBeVisible();
      await expect(moderatorPage.getByRole('button', { name: '2 min' })).toBeVisible();
      await expect(moderatorPage.getByRole('button', { name: '5 min' })).toBeVisible();
      await expect(moderatorPage.getByRole('button', { name: 'Custom' })).toBeVisible();
      await moderatorPage.getByRole('button', { name: 'Custom' }).click();
      const customDurationInput = moderatorPage.getByRole('spinbutton');
      await expect(customDurationInput).toHaveValue('1');
      await expect(customDurationInput).toHaveAttribute('type', 'number');
      await expect(moderatorPage.getByRole('button', { name: 'Close' })).toBeVisible();
      await expect(moderatorPage.getByRole('button', { name: 'Save' })).toBeVisible();
    });
    test('TC_003_Meeting Room_As Moderator_Timer_Duration_Session Duration', async () => {
      const { moderatorPage } = moderatorMeeting;

      await setTimerDuration(moderatorPage, 'Unlimited Time');
      await setTimerDuration(moderatorPage, '1 min');
      await setTimerDuration(moderatorPage, '2 min');
      await setTimerDuration(moderatorPage, '5 min');
      await setTimerDuration(moderatorPage, 'Custom');
      await moderatorPage.getByRole('button', { name: 'min' }).click();
      await moderatorPage.getByRole('button', { name: '5 min' }).click();
      await moderatorPage.getByRole('button', { name: 'Close' }).click();
      await expect(moderatorPage.getByRole('button', { name: '3 min' })).toBeVisible();
    });
  });
  test.describe('start timers with various durations', () => {
    test('TC_004_Meeting Room_As Moderator_Timer_Create Timer_With Unlimited Time', async () => {
      //timer with unlimited time counts correctly
      const timerProperties = {
        title: 'Unlimited Time',
        duration: 'Unlimited Time',
      };
      const { moderatorPage } = moderatorMeeting;
      const { participantPage } = participantMeeting;
      await startTimer(moderatorPage, timerProperties);

      await checkIfTimerStartedCorrectly(moderatorPage, timerProperties);
      await checkIfTimerPopupAppeared(participantPage, timerProperties);
      const timeDisplayString = await moderatorPage.locator('_react=TimerDuration').nth(0).innerText();
      const { checkIfTimerCountsCorrectly } = timerChecks(moderatorPage, timerProperties, timeDisplayString);
      await checkIfTimerCountsCorrectly();
      await stopTimer(moderatorPage);
    });
    test('TC_005_Meeting Room_As Moderator_Timer_Create Timer_With Duration – 1min/2min/5min', async () => {
      //timers with all fixed minute durations count correctly
      test.setTimeout(60000);
      const { moderatorPage } = moderatorMeeting;
      const { participantPage } = participantMeeting;
      await moderatorPage.getByRole('tab', { name: 'Timer' }).click();

      for (const duration of FIXED_TIMER_DURATIONS) {
        const timerProperties = { title: 'A new Timer', duration };
        await startTimer(moderatorPage, timerProperties);
        await checkIfTimerStartedCorrectly(moderatorPage, timerProperties);
        await checkIfTimerPopupAppeared(participantPage, timerProperties);
        const timeDisplayString = await moderatorPage.locator('_react=TimerDuration').nth(0).innerText();
        const { checkIfTimerCountsCorrectly, checkIfTimerDurationIsCorrect } = timerChecks(
          moderatorPage,
          timerProperties,
          timeDisplayString
        );
        await checkIfTimerDurationIsCorrect();
        await checkIfTimerCountsCorrectly();
        await stopTimer(moderatorPage);
      }
    });
    test('TC_006_Meeting Room_As Moderator_Timer_Create Timer_With Duration – Custom', async () => {
      //timer with custom duration counts correctly
      const { moderatorPage } = moderatorMeeting;
      const { participantPage } = participantMeeting;
      await moderatorPage.getByRole('tab', { name: 'Timer' }).click();

      const timerProperties = { title: 'Custom', duration: 'Custom' };
      await startTimer(moderatorPage, timerProperties);
      await checkIfTimerPopupAppeared(participantPage, timerProperties);
      await checkIfTimerStartedCorrectly(moderatorPage, timerProperties);
      const timeDisplayString = await moderatorPage.locator('_react=TimerDuration').nth(0).innerText();
      const { checkIfTimerCountsCorrectly, checkIfTimerDurationIsCorrect } = timerChecks(
        moderatorPage,
        timerProperties,
        timeDisplayString
      );
      await checkIfTimerDurationIsCorrect();
      await checkIfTimerCountsCorrectly();
      await stopTimer(moderatorPage);
    });
  });
  test.describe('test various timer configurations', () => {
    test('TC_007_Meeting Room_As Moderator_Timer_Create Timer_With Title', async () => {
      const { moderatorPage } = moderatorMeeting;
      const { participantPage } = participantMeeting;
      await moderatorPage.getByRole('tab', { name: 'Timer' }).click();

      const timerProperties = { title: 'Timer with title', duration: '1 min' };
      await startTimer(moderatorPage, timerProperties);
      await checkIfTimerStartedCorrectly(moderatorPage, timerProperties);
      await checkIfTimerPopupAppeared(participantPage, timerProperties);
      await stopTimer(moderatorPage);
    });

    test('TC_008_Meeting Room_As Moderator_Timer_Create Timer_Without Title', async () => {
      const { moderatorPage } = moderatorMeeting;
      const { participantPage } = participantMeeting;
      await moderatorPage.getByRole('tab', { name: 'Timer' }).click();

      const timerProperties = { duration: '1 min' };
      await startTimer(moderatorPage, timerProperties);
      await checkIfTimerStartedCorrectly(moderatorPage, timerProperties);
      await checkIfTimerPopupAppeared(participantPage, timerProperties);
      await stopTimer(moderatorPage);
    });

    test('TC_009_Meeting Room_As Moderator_Timer_Create Timer_With “Ask participants if they are ready” toggle button as ON', async () => {
      const { moderatorPage } = moderatorMeeting;
      const { participantPage } = participantMeeting;
      await moderatorPage.getByRole('tab', { name: 'Timer' }).click();

      const timerProperties = {
        title: 'This timer runs to the end',
        duration: '1 min',
      };
      await startTimer(moderatorPage, timerProperties);
      await checkIfTimerStartedCorrectly(moderatorPage, timerProperties);
      await checkIfTimerPopupAppeared(participantPage, timerProperties);
      await stopTimer(moderatorPage);
    });

    test('TC_010_Meeting Room_As Moderator_Timer_Create Timer_With “Ask participants if they are ready” toggle button as OFF', async () => {
      const { moderatorPage } = moderatorMeeting;
      const { participantPage } = participantMeeting;
      await moderatorPage.getByRole('tab', { name: 'Timer' }).click();

      const timerProperties = {
        title: 'This timer runs to the end',
        duration: '1 min',
        waitForParticipants: false,
      };
      await startTimer(moderatorPage, timerProperties);
      await checkIfTimerStartedCorrectly(moderatorPage, timerProperties);
      await checkIfTimerPopupAppeared(participantPage, timerProperties);
      await stopTimer(moderatorPage);
    });
  });
  test.describe('wait for timer to finish', () => {
    test('test if timer finished alert is correct and if UI resets to default settings', async () => {
      test.setTimeout(80000);
      const { moderatorPage } = moderatorMeeting;
      const { participantPage } = participantMeeting;
      await moderatorPage.getByRole('tab', { name: 'Timer' }).click();

      const timerProperties = {
        title: 'This timer runs to the end',
        duration: '1 min',
      };
      await startTimer(moderatorPage, timerProperties);
      await checkIfTimerStartedCorrectly(moderatorPage, timerProperties);
      await checkIfTimerPopupAppeared(participantPage, timerProperties);
      await waitForTimerToFinish(moderatorPage);
      await Promise.all([
        checkAlert(moderatorPage, 'The timer ran out'),
        checkAlert(participantPage, 'The timer ran out'),
      ]);
      await checkIfTimerUiElementsAreAtDefaultSetting(moderatorPage);
    });
  });
  test.describe('stop timers manually', () => {
    test('TC_011_Meeting Room_As Moderator_Timer_Stop Timer', async () => {
      const { moderatorPage } = moderatorMeeting;
      const { participantPage } = participantMeeting;
      const theCorrectAlert = 'The timer was stopped';
      await moderatorPage.getByRole('tab', { name: 'Timer' }).click();

      const timerProperties = {
        title: 'This timer will be stopped',
        duration: '1 min',
      };
      await startTimer(moderatorPage, timerProperties);
      await checkIfTimerStartedCorrectly(moderatorPage, timerProperties);
      await checkIfTimerPopupAppeared(participantPage, timerProperties);
      await stopTimer(moderatorPage);
      await Promise.all([checkAlert(moderatorPage, theCorrectAlert), checkAlert(participantPage, theCorrectAlert)]);
    });
    test('TC_012_Meeting Room_As Moderator_Timer_Mark me as done', async () => {
      const { moderatorPage } = moderatorMeeting;
      const { participantPage, participantUserName } = participantMeeting;
      await moderatorPage.getByRole('tab', { name: 'Timer' }).click();

      const timerProperties = {
        title: 'This timer will be stopped',
        duration: '1 min',
      };
      await startTimer(moderatorPage, timerProperties);
      await checkIfTimerStartedCorrectly(moderatorPage, timerProperties);
      await checkIfTimerPopupAppeared(participantPage, timerProperties);
      await checkParticipantList(moderatorPage, participantUserName);
      await participantPage.getByRole('button', { name: 'Mark me as done' }).click();
      await checkIfParticipantClickedOnDone(moderatorPage);
      await stopTimer(moderatorPage);
    });
    test.skip('check that a participant who joined after a timer started sees the timer title #1135', async ({
      page,
      context,
    }) => {
      //TODO: unlock this test after completing issue #1135/#1696
      const { moderatorPage, meetingLink } = await openModeratorMeeting(page);
      await moderatorPage.getByRole('tab', { name: 'Timer' }).click();

      const timerProperties = { title: 'Can you see me?', duration: '1 min' };
      await startTimer(moderatorPage, timerProperties);
      const { participantPage } = await openParticipantMeeting(context, meetingLink);
      await checkIfTimerPopupAppeared(participantPage, timerProperties);
      await stopTimer(moderatorPage);
    });
  });
});
