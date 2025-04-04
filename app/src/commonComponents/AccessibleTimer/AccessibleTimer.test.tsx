// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render } from '@testing-library/react';
import { Duration } from 'date-fns';

import AccessibleTimer from './AccessibleTimer';
import { LAST_SECONDS_OF_A_MINUTE, LAST_SECONDS_OF_TOTAL_TIME } from './constants';

describe('Accessible Timer', () => {
  test('announces remaining time as "more than "x" minutes left" on first render and ""x" minutes left" on the next minute update', () => {
    let remainingTime: Duration = { minutes: 4, seconds: 59 };
    const screen = render(<AccessibleTimer remainingTime={remainingTime} />);
    expect(screen.getByText('timer-more-than-message')).toBeInTheDocument();

    remainingTime = { minutes: 3, seconds: 59 };
    screen.rerender(<AccessibleTimer remainingTime={remainingTime} />);
    expect(screen.getByText('timer-update-message')).toBeInTheDocument();
  });
  test('doesn"t announces remaining time, if renders in the last seconds of a minute, but will announce next minute update ', () => {
    let remainingTime: Duration = { minutes: 4, seconds: LAST_SECONDS_OF_A_MINUTE - 1 };
    const screen = render(<AccessibleTimer remainingTime={remainingTime} />);
    expect(screen.queryByText(/./)).not.toBeInTheDocument();

    remainingTime = { minutes: 3, seconds: 59 };
    screen.rerender(<AccessibleTimer remainingTime={remainingTime} />);
    expect(screen.getByText('timer-update-message')).toBeInTheDocument();
  });
  test('announces "less than one minute left" ', () => {
    const remainingTime: Duration = { minutes: 0, seconds: 59 };
    const screen = render(<AccessibleTimer remainingTime={remainingTime} />);
    expect(screen.getByText('timer-less-than-message')).toBeInTheDocument();
  });
  test('announces last seconds of the total time ', () => {
    const remainingTime: Duration = { minutes: 0, seconds: LAST_SECONDS_OF_TOTAL_TIME - 1 };
    const screen = render(<AccessibleTimer remainingTime={remainingTime} />);
    expect(screen.getByText('timer-last-seconds-message')).toBeInTheDocument();
  });
  test('adds feature name to the announcement', () => {
    const remainingTime: Duration = { minutes: 4, seconds: 59 };
    const feature = 'Coffee break';
    const screen = render(<AccessibleTimer remainingTime={remainingTime} feature={feature} />);
    expect(screen.getByText(`${feature}. timer-more-than-message`)).toBeInTheDocument();
  });
});
