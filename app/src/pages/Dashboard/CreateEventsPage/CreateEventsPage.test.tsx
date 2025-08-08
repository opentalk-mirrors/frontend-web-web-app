// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen } from '@testing-library/react';

import CreateEventsPage from './CreateEventsPage';

vi.mock('../../../components/MeetingForms', () => ({
  __esModule: true,
  CreateMeetingForm: () => <div data-testid="CreateMeetingForm" />,
}));

vi.mock('../../../components/RequiredFieldsInfo', () => ({
  __esModule: true,
  RequiredFieldsInfo: () => <div data-testid="RequiredFieldsInfo" />,
}));

describe('CreateEventsPage', () => {
  it('sets document title', () => {
    render(<CreateEventsPage />);
    expect(document.title).toBe('dashboard-meetings-create-title in OpenTalk');
  });

  it('renders heading', () => {
    render(<CreateEventsPage />);
    expect(screen.getByRole('heading', { name: 'dashboard-meetings-create-title', level: 1 })).toBeInTheDocument();
  });

  it('renders form progress steps', () => {
    render(<CreateEventsPage />);
    expect(screen.getByText('global-meeting')).toBeInTheDocument();
    expect(screen.getByText('global-participants')).toBeInTheDocument();
  });

  it('renders the required info fields', () => {
    render(<CreateEventsPage />);
    expect(screen.getByTestId('RequiredFieldsInfo')).toBeInTheDocument();
  });

  it('renders create meeting form', () => {
    render(<CreateEventsPage />);
    expect(screen.getByTestId('CreateMeetingForm')).toBeInTheDocument();
  });
});
