// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import { act } from 'react';
import { afterAll, beforeAll } from 'vitest';

import { renderWithProviders } from '../../utils/testUtils';
import VoteAndPollCountdown from './VoteAndPollCountdown';

const START_TIME = '2024-01-01T12:00:00Z' as const;

describe('VoteAndPollCountdown', () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('renders zero time when countdown is inactive', () => {
    vi.setSystemTime(new Date(START_TIME));

    renderWithProviders(<VoteAndPollCountdown active={false} duration={120} startTime={START_TIME} />, {
      provider: { mui: true },
    });

    expect(screen.getByText('00:00')).toBeInTheDocument();
  });

  it('shows the remaining time and updates every second while active', () => {
    vi.setSystemTime(new Date(START_TIME));

    renderWithProviders(<VoteAndPollCountdown active duration={3661} startTime={START_TIME} />, {
      provider: { mui: true },
    });

    expect(screen.getByText('01:01:01')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('01:01:00')).toBeInTheDocument();
  });

  it('reaches zero once the countdown has finished and stays there', () => {
    vi.setSystemTime(new Date(START_TIME));

    renderWithProviders(<VoteAndPollCountdown active duration={1} startTime={START_TIME} />, {
      provider: { mui: true },
    });

    expect(screen.getByText('00:01')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('00:00')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByText('00:00')).toBeInTheDocument();
  });
});
