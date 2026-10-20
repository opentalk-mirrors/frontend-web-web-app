// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { act, render, screen } from '@testing-library/react';

import AnimationTimerDown from './AnimationTimerDown';

const START = new Date('2024-01-01T12:00:00Z').getTime();

describe('AnimationTimerDown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(START);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts at the actual remaining time instead of a full minute', () => {
    render(<AnimationTimerDown endsAt={START + 30_000} />);

    expect(screen.getByText('30s')).toBeInTheDocument();
  });

  it('counts down to zero exactly when the deadline is reached', () => {
    render(<AnimationTimerDown endsAt={START + 30_000} />);

    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(screen.getByText('20s')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(20_000);
    });
    expect(screen.getByText('0s')).toBeInTheDocument();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('caps the countdown at one minute', () => {
    render(<AnimationTimerDown endsAt={START + 90_000} />);

    expect(screen.getByText('60s')).toBeInTheDocument();
  });
});
