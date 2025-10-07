// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen, act } from '@testing-library/react';

import ProgressBar from './ProgressBar';

vi.useFakeTimers({
  now: 0,
});

describe('ProgressBar', () => {
  it('can render progress bar with 50%', async () => {
    render(<ProgressBar startTime={0} endTime={2000} isFinished={false} />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const progressBar = screen.getByRole('progressbar');

    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '50');
  });

  it('renders progress bar with 100% when finished', () => {
    render(<ProgressBar startTime={0} endTime={2000} isFinished={true} />);
    const progressBar = screen.getByRole('progressbar');

    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '100');
  });

  it('renders progress bar with 0% when startTime is in the future', () => {
    render(<ProgressBar startTime={3000} endTime={2000} isFinished={false} />);
    const progressBar = screen.getByRole('progressbar');

    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
  });

  it('renders progress bar with 100% when time advances over endTime', async () => {
    render(<ProgressBar startTime={0} endTime={2000} isFinished={false} />);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    const progressBar = screen.getByRole('progressbar');

    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '100');
  });
});
