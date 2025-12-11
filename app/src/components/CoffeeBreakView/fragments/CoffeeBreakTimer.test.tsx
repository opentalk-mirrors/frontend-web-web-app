// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen, waitFor } from '@testing-library/react';

import CoffeeBreakTimer from './CoffeeBreakTimer';

const mockUseRemainingDurationOfTimer = vi.fn();
const mockUseAppSelector = vi.fn();
const mockAccessibleTimer = vi.fn();

vi.mock('../../../hooks', () => ({
  useRemainingDurationOfTimer: () => mockUseRemainingDurationOfTimer(),
  useAppSelector: (selector: unknown) => mockUseAppSelector(selector),
}));

vi.mock('../../../commonComponents/AccessibleTimer', () => ({
  __esModule: true,
  default: (props: { remainingTime: { minutes: number; seconds: number }; feature: string }) => {
    mockAccessibleTimer(props);
    return (
      <div data-testid="accessible-timer" data-feature={props.feature}>
        {props.remainingTime.minutes}:{props.remainingTime.seconds}
      </div>
    );
  },
}));

describe('CoffeeBreakTimer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders remaining time and passes it to the accessible timer', () => {
    const remainingTime = { duration: { minutes: 4, seconds: 15 }, durationString: '04 : 15' };
    mockUseRemainingDurationOfTimer.mockReturnValue(remainingTime);
    mockUseAppSelector.mockReturnValue({ minutes: 10 });

    render(<CoffeeBreakTimer />);

    expect(screen.getByText(remainingTime.durationString)).toBeInTheDocument();
    const accessibleTimer = screen.getByTestId('accessible-timer');
    expect(accessibleTimer).toBeInTheDocument();
    expect(accessibleTimer).toHaveAttribute('data-feature', 'coffee-break-tab-title');
    expect(mockAccessibleTimer).toHaveBeenCalledWith(
      expect.objectContaining({
        remainingTime: remainingTime.duration,
        feature: 'coffee-break-tab-title',
      })
    );
  });

  it('does not render the accessible timer if remaining time is missing', () => {
    mockUseRemainingDurationOfTimer.mockReturnValue(undefined);
    mockUseAppSelector.mockReturnValue({ minutes: 5 });

    render(<CoffeeBreakTimer />);

    expect(screen.getByTestId('timer-typography')).toBeInTheDocument();
    expect(screen.queryByTestId('accessible-timer')).not.toBeInTheDocument();
  });

  // Test different scenarios for when the timer should turn red, when a color is set the value starts with '#'
  it.each([
    { initialMinutes: 5, remainingMinutes: 0, expectedColorStyleValue: /#/ },
    { initialMinutes: 10, remainingMinutes: 2, expectedColorStyleValue: /#/ },
    { initialMinutes: 20, remainingMinutes: 4, expectedColorStyleValue: /#/ },
    { initialMinutes: 10, remainingMinutes: 3, expectedColorStyleValue: '' },
  ])(
    'marks the timer red when $remainingMinutes minutes remain of a $initialMinutes minute break',
    async ({ initialMinutes, remainingMinutes, expectedColorStyleValue }) => {
      const remainingTime = {
        duration: { minutes: remainingMinutes, seconds: 10 },
        durationString: 'stub-duration',
      };
      mockUseRemainingDurationOfTimer.mockReturnValue(remainingTime);
      mockUseAppSelector.mockReturnValue({ minutes: initialMinutes });

      render(<CoffeeBreakTimer />);

      const styles = getComputedStyle(screen.getByText(remainingTime.durationString));
      await waitFor(() => expect(styles.color).toMatch(expectedColorStyleValue));
    }
  );
});
