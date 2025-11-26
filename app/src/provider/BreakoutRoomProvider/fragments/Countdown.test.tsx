// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen, act } from '@testing-library/react';

import Countdown from './Countdown';

describe('Countdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });

  afterEach(() => {
    act(() => {
      vi.runOnlyPendingTimers();
    });
    vi.useRealTimers();
  });

  it('renders the initial remaining time', () => {
    render(<Countdown started={0} duration={10} />);

    expect(screen.getByText('10s')).toBeInTheDocument();
  });

  it('updates remaining time as the countdown progresses', () => {
    render(<Countdown started={0} duration={5} />);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByText('3s')).toBeInTheDocument();
  });

  it('calls onCountdownEnds when the timer reaches zero', () => {
    const onCountdownEnds = vi.fn();
    render(<Countdown started={0} duration={2} onCountdownEnds={onCountdownEnds} />);

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(onCountdownEnds).toHaveBeenCalledTimes(1);
    expect(screen.getByText('0s')).toBeInTheDocument();
  });
});
