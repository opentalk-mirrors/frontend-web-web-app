// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { readyToContinue } from '../../../api/types/outgoing/timer';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import NormalTimerPopover from './NormalTimerPopover';

vi.mock('../../../api/types/outgoing/common', () => ({
  sendMessage: vi.fn(),
}));

vi.mock('../../TimerTab/fragments/TimerDuration', () => ({
  __esModule: true,
  default: () => <div data-testid="timer-duration" />,
}));

const DEFAULT_TIMER_STATE = {
  timerId: 'timer-123',
  title: 'Daily standup',
  readyCheckEnabled: true,
  participantsReady: [] as string[],
};

const DEFAULT_USER_STATE = {
  uuid: 'user-1',
};

const renderComponent = (
  timerOverrides: Partial<typeof DEFAULT_TIMER_STATE> = {},
  userOverrides: Partial<typeof DEFAULT_USER_STATE> = {}
) => {
  const { store, dispatchSpy } = configureStore({
    initialState: {
      timer: { ...DEFAULT_TIMER_STATE, ...timerOverrides },
      user: { ...DEFAULT_USER_STATE, ...userOverrides },
    },
  });

  renderWithProviders(<NormalTimerPopover />, { store, provider: { mui: true } });

  return { dispatchSpy };
};

describe('NormalTimerPopover', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders timer information and action button when ready check is enabled', () => {
    renderComponent();

    expect(screen.getByRole('dialog', { name: DEFAULT_TIMER_STATE.title })).toBeInTheDocument();
    expect(screen.getByText('timer-popover-title')).toBeInTheDocument();
    expect(screen.getByText(DEFAULT_TIMER_STATE.title)).toBeInTheDocument();
    expect(screen.getByTestId('timer-duration')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'timer-popover-button-done' })).toBeInTheDocument();
  });

  it('keeps the popover hidden when no timer is active', () => {
    renderComponent({ timerId: undefined });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('dispatches readyToContinue with status true when marking the user ready', async () => {
    const user = userEvent.setup();
    const { dispatchSpy } = renderComponent({ participantsReady: [] });

    await user.click(screen.getByRole('button', { name: 'timer-popover-button-done' }));

    expect(dispatchSpy.mock.calls).toContainEqual([
      readyToContinue.action({ timerId: DEFAULT_TIMER_STATE.timerId, status: true }),
    ]);
  });

  it('dispatches readyToContinue with status false when toggling readiness off', async () => {
    const user = userEvent.setup();
    const { dispatchSpy } = renderComponent({ participantsReady: [DEFAULT_USER_STATE.uuid] });

    await user.click(screen.getByRole('button', { name: 'timer-popover-button-not-done' }));

    expect(dispatchSpy.mock.calls).toContainEqual([
      readyToContinue.action({ timerId: DEFAULT_TIMER_STATE.timerId, status: false }),
    ]);
  });

  it('does not show the ready button when ready check is disabled', () => {
    renderComponent({ readyCheckEnabled: false });

    expect(screen.queryByRole('button', { name: /timer-popover-button/ })).not.toBeInTheDocument();
  });
});
