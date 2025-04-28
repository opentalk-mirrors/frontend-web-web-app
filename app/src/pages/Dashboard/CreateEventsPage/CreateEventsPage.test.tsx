// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, render, screen } from '@testing-library/react';

import CreateEventsPage from './CreateEventsPage';

jest.mock('../../../components/CreateOrUpdateMeetingForm', () => ({
  __esModule: true,
  default: ({ onForwardButtonClick }: { onForwardButtonClick: () => void }) => (
    <button data-testid="CreateOrUpdateMeetingForm" onClick={onForwardButtonClick} />
  ),
}));

describe('CreateEventsPage', () => {
  it('renders <h1 />', () => {
    render(<CreateEventsPage />);
    expect(screen.getByText('dashboard-meetings-create-title')).toHaveProperty('tagName', 'H1');
  });

  it('renders CreateOrUpdateMeetingForm when active step is 0', () => {
    render(<CreateEventsPage />);
    expect(screen.getByTestId('CreateOrUpdateMeetingForm')).toBeInTheDocument();
  });

  it('hides CreateOrUpdateMeetingForm when active step is 1', () => {
    render(<CreateEventsPage />);
    fireEvent.click(screen.getByTestId('CreateOrUpdateMeetingForm'));

    expect(screen.queryByTestId('CreateOrUpdateMeetingForm')).not.toBeInTheDocument();
  });
});
