// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen } from '@testing-library/react';
import { Duration } from 'date-fns';

import AccessibleTimer from './AccessibleTimer';
import { LAST_SECONDS_OF_A_MINUTE, LAST_SECONDS_OF_TOTAL_TIME } from './constants';

describe('Accessible Timer', () => {
  it('announces remaining time as "more than "x" minutes left" on first render and ""x" minutes left" on the next minute update', () => {
    let remainingTime: Duration = { minutes: 4, seconds: 59 };
    const { rerender } = render(<AccessibleTimer remainingTime={remainingTime} />);
    expect(screen.getByText('timer-more-than-message')).toBeInTheDocument();

    remainingTime = { minutes: 3, seconds: 59 };
    rerender(<AccessibleTimer remainingTime={remainingTime} />);
    expect(screen.getByText('timer-update-message')).toBeInTheDocument();
  });
  it('doesn"t announces remaining time, if renders in the last seconds of a minute, but will announce next minute update', () => {
    let remainingTime: Duration = { minutes: 4, seconds: LAST_SECONDS_OF_A_MINUTE - 1 };
    const { rerender } = render(<AccessibleTimer remainingTime={remainingTime} />);
    expect(screen.queryByText(/./)).not.toBeInTheDocument();

    remainingTime = { minutes: 3, seconds: 59 };
    rerender(<AccessibleTimer remainingTime={remainingTime} />);
    expect(screen.getByText('timer-update-message')).toBeInTheDocument();
  });
  it('announces "less than one minute left"', () => {
    const remainingTime: Duration = { minutes: 0, seconds: 59 };
    render(<AccessibleTimer remainingTime={remainingTime} />);
    expect(screen.getByText('timer-less-than-message')).toBeInTheDocument();
  });
  it('announces last seconds of the total time', () => {
    const remainingTime: Duration = { minutes: 0, seconds: LAST_SECONDS_OF_TOTAL_TIME - 1 };
    render(<AccessibleTimer remainingTime={remainingTime} />);
    expect(screen.getByText('timer-last-seconds-message')).toBeInTheDocument();
  });
  it('adds feature name to the announcement', () => {
    const remainingTime: Duration = { minutes: 4, seconds: 59 };
    const feature = 'Coffee break';
    render(<AccessibleTimer remainingTime={remainingTime} feature={feature} />);
    expect(screen.getByText(`${feature}. timer-more-than-message`)).toBeInTheDocument();
  });
});
