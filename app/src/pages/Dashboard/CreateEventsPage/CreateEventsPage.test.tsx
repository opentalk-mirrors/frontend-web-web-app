// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { renderWithProviders } from '../../../utils/testUtils';
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
    renderWithProviders(<CreateEventsPage />, { provider: { mui: true } });
    expect(document.title).toBe('dashboard-meetings-create-title in OpenTalk');
  });

  it('renders heading', () => {
    renderWithProviders(<CreateEventsPage />, { provider: { mui: true } });
    expect(screen.getByRole('heading', { name: 'dashboard-meetings-create-title', level: 1 })).toBeInTheDocument();
  });

  it('renders form progress steps', () => {
    renderWithProviders(<CreateEventsPage />, { provider: { mui: true } });
    expect(screen.getByText('global-meeting')).toBeInTheDocument();
    expect(screen.getByText('global-participants')).toBeInTheDocument();
  });

  it('renders the required info fields', () => {
    renderWithProviders(<CreateEventsPage />, { provider: { mui: true } });
    expect(screen.getByTestId('RequiredFieldsInfo')).toBeInTheDocument();
  });

  it('renders create meeting form', () => {
    renderWithProviders(<CreateEventsPage />, { provider: { mui: true } });
    expect(screen.getByTestId('CreateMeetingForm')).toBeInTheDocument();
  });
});
