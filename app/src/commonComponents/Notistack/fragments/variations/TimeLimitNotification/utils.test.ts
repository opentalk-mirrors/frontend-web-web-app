// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { MINUTE_MS } from '../../../../../utils/timeFormatUtils';
import { startTimeLimitNotification, stopTimeLimitNotification } from './utils';

const { toast, close } = vi.hoisted(() => ({ toast: vi.fn(), close: vi.fn() }));

vi.mock('../../../../../logger', () => ({
  default: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock('../../utils', () => ({
  DEFAULT_AUTO_HIDE_DURATION: 7000,
  notifications: { toast, close },
}));

const SNACKBAR_KEY = 'time-limit-key';
const START = new Date('2024-01-01T12:00:00Z').getTime();
const endsInMinutes = (minutes: number) => new Date(START + minutes * MINUTE_MS).toISOString();
const shownMinutes = () => toast.mock.calls.map(([, options]) => options.minutes);

describe('time limit notification', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(START);
    toast.mockReset().mockReturnValue(SNACKBAR_KEY);
    close.mockReset();
  });

  afterEach(() => {
    stopTimeLimitNotification();
    vi.useRealTimers();
  });

  it('counts down to one minute without ever showing an empty "0 minutes" notification', async () => {
    await startTimeLimitNotification(endsInMinutes(5));

    await vi.advanceTimersByTimeAsync(MINUTE_MS - 1);

    expect(shownMinutes()).toEqual([5]);
    expect(close).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(10 * MINUTE_MS);

    expect(shownMinutes()).toEqual([5, 4, 3, 2, 1]);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('passes the conference end time to the notification', async () => {
    await startTimeLimitNotification(endsInMinutes(5));

    expect(toast).toHaveBeenCalledExactlyOnceWith('', expect.objectContaining({ endsAt: START + 5 * MINUTE_MS }));
  });

  it('closes the open notification when stopped', async () => {
    await startTimeLimitNotification(endsInMinutes(6));
    await vi.advanceTimersByTimeAsync(MINUTE_MS);
    expect(toast).toHaveBeenCalledOnce();
    close.mockClear();

    stopTimeLimitNotification();

    expect(close).toHaveBeenCalledExactlyOnceWith(SNACKBAR_KEY);
    expect(vi.getTimerCount()).toBe(0);

    await vi.advanceTimersByTimeAsync(6 * MINUTE_MS);

    expect(toast).toHaveBeenCalledOnce();
  });

  it('drops a notification that is still pending while it gets stopped', async () => {
    await startTimeLimitNotification(endsInMinutes(6));
    await vi.advanceTimersByTimeAsync(2 * MINUTE_MS);
    expect(toast).toHaveBeenCalledOnce();

    stopTimeLimitNotification();

    expect(vi.getTimerCount()).toBe(0);
    await vi.advanceTimersByTimeAsync(5 * MINUTE_MS);

    expect(toast).toHaveBeenCalledOnce();
  });

  it('cancels a pending replacement when a new run starts', async () => {
    await startTimeLimitNotification(endsInMinutes(6));
    await vi.advanceTimersByTimeAsync(2 * MINUTE_MS);

    await startTimeLimitNotification(endsInMinutes(5.5));
    await vi.advanceTimersByTimeAsync(1000);

    expect(shownMinutes()).toEqual([5, 4]);
    expect(vi.getTimerCount()).toBe(1);
  });

  it('leaves no timers after a short remaining duration expires', async () => {
    await startTimeLimitNotification(endsInMinutes(0.5));

    await vi.advanceTimersByTimeAsync(MINUTE_MS / 2);

    expect(close).toHaveBeenCalledExactlyOnceWith(SNACKBAR_KEY);
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([endsInMinutes(0), endsInMinutes(-1), 'invalid'])(
    'ignores an expired or invalid deadline: %s',
    async (deadline) => {
      await startTimeLimitNotification(deadline);

      expect(toast).not.toHaveBeenCalled();
      expect(vi.getTimerCount()).toBe(0);
    }
  );
});
