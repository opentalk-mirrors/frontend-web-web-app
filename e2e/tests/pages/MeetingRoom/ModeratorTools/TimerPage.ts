// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
// the popup that appears after clicking on more-options => invite guest
// in the meeting room
import { Locator, Page } from '@playwright/test';

export class TimerPage {
  public readonly page: Page;
  public readonly timerHeading: Locator;
  public readonly duration: {
    readonly durationSelectionButton: Locator;
    readonly sessionDurationPopup: Locator;
    readonly sessionDurationTitle: Locator;
    readonly unlimitedTimeButton: Locator;
    readonly oneMinuteButton: Locator;
    readonly twoMinutesButton: Locator;
    readonly fiveMinutesButton: Locator;
    readonly customDuration: {
      readonly customButton: Locator;
      readonly spinButton: Locator;
    };
    readonly closeButton: Locator;
    readonly saveButton: Locator;
  };
  public readonly titleTextbox: Locator;
  public readonly participantsReadyCheckbox: Locator;
  public readonly createTimer: {
    readonly createTimerButton: Locator;
    readonly tabPanel: {
      readonly tabPanelSection: Locator;
      readonly heading: Locator;
      readonly elapsedTimeLabel: Locator;
      readonly remainingTimeLabel: Locator;
      readonly time: Locator;
      readonly participantsHeading: Locator;
      readonly participantsNotDoneStatus: Locator;
      readonly participantsDoneStatus: Locator;
    };
    readonly timerStartedPopup: {
      readonly timerStartedHeading: Locator;
      readonly elapsedTimeLabel: Locator;
      readonly remainingTimeLabel: Locator;
      readonly time: Locator;
      readonly markMeAsDoneButton: Locator;
      readonly unmarkMeAsDoneButton: Locator;
    };
    readonly stopTimerButton: Locator;
    readonly timerStoppedAlert: Locator;
    readonly timerRanOutAlert: Locator;
  };

  constructor({ page }: { page: Page }) {
    this.page = page;
    this.timerHeading = this.page.getByRole('heading', { name: 'Timer' });
    this.duration = {
      durationSelectionButton: this.page.getByRole('button', { name: 'Duration' }),
      sessionDurationPopup: this.page.getByRole('dialog', { name: 'Session Duration' }),
      sessionDurationTitle: this.page.getByText('Session Duration', { exact: true }),
      unlimitedTimeButton: this.page.getByRole('button', { name: 'Unlimited duration' }),
      oneMinuteButton: this.page.getByRole('button', { name: '1 minute' }),
      twoMinutesButton: this.page.getByRole('button', { name: '2 minutes' }),
      fiveMinutesButton: this.page.getByRole('button', { name: '5 minutes' }),
      customDuration: {
        customButton: this.page.getByRole('button', { name: 'Custom duration' }),
        spinButton: this.page.getByRole('spinbutton'),
      },
      closeButton: this.page.getByRole('button', { name: 'Close' }),
      saveButton: this.page.getByRole('button', { name: 'Save' }),
    };
    this.titleTextbox = this.page.getByRole('textbox', { name: 'Title' });
    this.participantsReadyCheckbox = this.page.getByRole('checkbox', { name: 'Ask participants if they are ready' });
    this.createTimer = {
      createTimerButton: this.page.getByRole('button', { name: 'Create Timer' }),
      tabPanel: {
        tabPanelSection: this.page.getByRole('tabpanel', { name: 'Timer' }),
        heading: this.page.getByRole('tabpanel', { name: 'Timer' }).getByRole('heading', { name: 'Timer' }),
        elapsedTimeLabel: this.page.getByRole('tabpanel', { name: 'Timer' }).getByText('Elapsed time', { exact: true }),
        remainingTimeLabel: this.page
          .getByRole('tabpanel', { name: 'Timer' })
          .getByText('Remaining time', { exact: true }),
        time: this.page.getByRole('tabpanel', { name: 'Timer' }).getByText(/\b\d{1,2}\s*:\s*\d{2}\b/),
        participantsHeading: this.page.getByRole('heading', { name: 'Participants' }),
        participantsNotDoneStatus: this.page
          .getByRole('tabpanel', { name: 'Timer' })
          .getByRole('listitem')
          .filter({ has: this.page.getByRole('img', { name: 'Not done', exact: true }) })
          .locator('p'),
        participantsDoneStatus: this.page
          .getByRole('tabpanel', { name: 'Timer' })
          .getByRole('listitem')
          .filter({ has: this.page.getByRole('img', { name: 'Done', exact: true }) })
          .locator('p'),
      },
      timerStartedPopup: {
        timerStartedHeading: this.page.getByRole('heading', { name: 'A timer was started' }),
        elapsedTimeLabel: this.page.getByRole('dialog').getByText('Elapsed time', { exact: true }),
        remainingTimeLabel: this.page.getByRole('dialog').getByText('Remaining time', { exact: true }),
        time: this.page.getByRole('dialog').getByText(/\b\d{1,2}\s*:\s*\d{2}\b/),
        markMeAsDoneButton: this.page.getByRole('button', { name: 'Mark me as done', exact: true }),
        unmarkMeAsDoneButton: this.page.getByRole('button', { name: 'Unmark me as done', exact: true }),
      },
      stopTimerButton: this.page.getByRole('button', { name: 'Stop timer' }),
      timerStoppedAlert: this.page.getByRole('alert').getByText('The timer was stopped'),
      timerRanOutAlert: this.page.getByRole('alert').getByText('The timer ran out'),
    };
  }

  public async openDurationSelection() {
    await this.duration.durationSelectionButton.click();
  }

  public async closeDurationSelection() {
    await this.duration.closeButton.click();
  }

  public async selectTimerDuration(
    duration: 'oneMinute' | 'twoMinutes' | 'fiveMinutes' | 'unlimited'
  ): Promise<{ locator: Locator; accessibleName: string }> {
    switch (duration) {
      case 'oneMinute':
        await this.duration.oneMinuteButton.click();
        return { locator: this.duration.oneMinuteButton, accessibleName: 'Duration 1 minute' };

      case 'twoMinutes':
        await this.duration.twoMinutesButton.click();
        return { locator: this.duration.twoMinutesButton, accessibleName: 'Duration 2 minutes' };

      case 'fiveMinutes':
        await this.duration.fiveMinutesButton.click();
        return { locator: this.duration.fiveMinutesButton, accessibleName: 'Duration 5 minutes' };

      case 'unlimited':
        await this.duration.unlimitedTimeButton.click();
        return { locator: this.duration.unlimitedTimeButton, accessibleName: 'Duration Unlimited Time' };
    }
  }

  public async selectCustomDuration() {
    await this.duration.customDuration.customButton.click();
  }

  public async isDurationSelected(locator: Locator): Promise<boolean> {
    return await locator.evaluate((element) => element.getAttribute('aria-selected') === 'true');
  }

  public async saveSessionDuration() {
    await this.duration.saveButton.click();
  }

  public async enterCustomDuration(value?: string) {
    await this.duration.customDuration.spinButton.click();
    if (value) {
      await this.duration.customDuration.spinButton.fill(value);
    }
  }

  public async selectTimerTitleInput() {
    await this.titleTextbox.click();
  }

  public async enterTimerTitle(title: string) {
    await this.titleTextbox.fill(title);
  }

  public async getPlaceholderOfTimerTitleInput(): Promise<string> {
    return (await this.titleTextbox.getAttribute('placeholder'))!;
  }

  public async getTimerTitleInputValue(): Promise<string> {
    return await this.titleTextbox.inputValue();
  }

  public async createNewTimer() {
    await this.createTimer.createTimerButton.click();
  }

  public getTimerStartedPopup(title: string = 'A timer was started'): Locator {
    return this.page.getByRole('dialog', { name: title });
  }

  public getTimerTitle(title: string): Locator {
    return this.page.getByRole('heading', { name: title });
  }

  public async getParticipantsNotDoneStatus(): Promise<string[]> {
    const notDoneList: string[] = [];
    for (const notDoneParticipant of await this.createTimer.tabPanel.participantsNotDoneStatus.all()) {
      if (await notDoneParticipant.isVisible()) {
        notDoneList.push(await notDoneParticipant.innerText());
      }
    }
    return notDoneList;
  }

  public async getParticipantsDoneStatus(): Promise<string[]> {
    const doneList: string[] = [];
    for (const doneParticipant of await this.createTimer.tabPanel.participantsDoneStatus.all()) {
      if (await doneParticipant.isVisible()) {
        doneList.push(await doneParticipant.innerText());
      }
    }
    return doneList;
  }

  public async getTimerTimeInSeconds(locator: Locator): Promise<number> {
    const time = await locator.innerText();
    const min = parseInt(time.split(':')[0]);
    const sec = parseInt(time.split(':')[1]);
    return min * 60 + sec;
  }

  public async waitForRemainingTimerTime() {
    const remainingTime = (await this.getTimerTimeInSeconds(this.createTimer.tabPanel.time)) * 1000;
    await this.page.waitForTimeout(remainingTime);
  }

  public async stopTimer() {
    await this.createTimer.stopTimerButton.click();
  }

  public async isCountingUp(locator: Locator): Promise<boolean> {
    const prevSec = await this.getTimerTimeInSeconds(locator);
    await this.page.waitForTimeout(2000);
    const currentSec = await this.getTimerTimeInSeconds(locator);

    if (currentSec > prevSec) {
      return true;
    }
    return false;
  }

  public async toggleAskParticipantsIfReady(value: boolean) {
    await this.participantsReadyCheckbox.setChecked(value);
  }

  public async markMeAsDone() {
    await this.createTimer.timerStartedPopup.markMeAsDoneButton.click();
    await this.createTimer.timerStartedPopup.unmarkMeAsDoneButton.waitFor({ state: 'visible', timeout: 5000 });
  }

  public async unmarkMeAsDone() {
    await this.createTimer.timerStartedPopup.unmarkMeAsDoneButton.click();
    await this.createTimer.timerStartedPopup.markMeAsDoneButton.waitFor({ state: 'visible', timeout: 5000 });
  }
}
