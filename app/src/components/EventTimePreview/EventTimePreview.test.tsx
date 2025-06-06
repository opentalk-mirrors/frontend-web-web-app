// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen } from '@testing-library/react';

import EventTimePreview from './EventTimePreview';

const commonProps = {
  startDate: new Date('2023-10-01T10:00:00.000Z'),
  endDate: new Date('2023-10-01T12:00:00.000Z'),
};

describe('EventTimePreview', () => {
  it('renders the date and start-end time when dates are the same', async () => {
    render(<EventTimePreview {...commonProps} />);

    const dateElement = await screen.findByText('10/01/2023');
    const startTimeElement = await screen.findByText('10:00');
    const endTimeElement = await screen.findByText('12:00');

    expect(dateElement).toBeInTheDocument();
    expect(startTimeElement).toBeInTheDocument();
    expect(endTimeElement).toBeInTheDocument();
  });

  it('omits date part if start and end dates are different', async () => {
    const differentDatesProps = {
      startDate: new Date('2023-10-01T10:00:00.000Z'),
      endDate: new Date('2023-10-02T12:00:00.000Z'),
    };

    render(<EventTimePreview {...differentDatesProps} />);

    const startDateElement = screen.queryByText('10/01/2023');
    const startTimeElement = await screen.findByText('10:00');
    const endDateElement = screen.queryByText('10/02/2023');
    const endTimeElement = await screen.findByText('12:00');

    expect(startDateElement).not.toBeInTheDocument();
    expect(startTimeElement).toBeInTheDocument();
    expect(endDateElement).not.toBeInTheDocument();
    expect(endTimeElement).toBeInTheDocument();
  });
});
