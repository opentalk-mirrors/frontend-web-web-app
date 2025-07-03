// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';

import ProgressBar from './ProgressBar';

jest.useFakeTimers({
  now: 0,
});

describe('ProgressBar', () => {
  it('can render progress bar with 50%', async () => {
    render(<ProgressBar startTime={0} endTime={2000} isFinished={false} />);
    act(() => {
      jest.advanceTimersByTime(1000); // Simulate time passing
    });
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    await waitFor(() => {
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
    });
  });

  it('renders progress bar with 100% when finished', async () => {
    render(<ProgressBar startTime={0} endTime={2000} isFinished={true} />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    await waitFor(() => {
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    });
  });

  it('renders progress bar with 0% when startTime is in the future', async () => {
    render(<ProgressBar startTime={3000} endTime={2000} isFinished={false} />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    await waitFor(() => {
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    });
  });

  it('renders progress bar with 100% when time advances over endTime', async () => {
    render(<ProgressBar startTime={0} endTime={2000} isFinished={false} />);
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    await waitFor(() => {
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    });
  });
});
