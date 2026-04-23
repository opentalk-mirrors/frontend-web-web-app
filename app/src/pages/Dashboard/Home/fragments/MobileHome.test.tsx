// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import MobileHome from './MobileHome';

vi.mock('./AdhocMeetingButton', () => ({
  default: () => <div data-testid="adhoc-button"></div>,
}));

vi.mock('../../../../components/JoinMeetingDialog', () => ({
  default: () => <div data-testid="join-meeting-dialog"></div>,
}));

vi.mock('./NewMeetingButton', () => ({
  default: () => <div data-testid="new-meeting-button"></div>,
}));

vi.mock('./CurrentMeetings', () => ({
  default: () => <div data-testid="current-meetings"></div>,
}));

vi.mock('./FavoriteMeetings', () => ({
  default: () => <div data-testid="favorite-meetings"></div>,
}));

describe('MobileHome', () => {
  it('renders header buttons', () => {
    render(<MobileHome />);
    expect(screen.getByTestId('adhoc-button')).toBeInTheDocument();
    expect(screen.getByTestId('join-meeting-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('new-meeting-button')).toBeInTheDocument();
  });
  it('renders view selector and current meetings by default', () => {
    render(<MobileHome />);
    const viewSelector = screen.getByRole('combobox', { name: 'dashboard-meeting-mobile-view-select' });
    expect(viewSelector).toBeInTheDocument();
    expect(viewSelector).toHaveTextContent('dashboard-current-meetings');

    const currentMeetingsHeader = screen.getByRole('heading', { name: 'dashboard-current-meetings' });
    expect(currentMeetingsHeader).toBeInTheDocument();

    expect(screen.getByTestId('current-meetings')).toBeInTheDocument();
  });
  it('renders current and favorite options in the view selector menu', async () => {
    render(<MobileHome />);

    const viewSelector = screen.getByRole('combobox', { name: 'dashboard-meeting-mobile-view-select' });
    await userEvent.click(viewSelector);

    const options = screen.getAllByRole('option');
    expect(options.length).toEqual(2);
    expect(options[0]).toHaveTextContent('dashboard-current-meetings');
    expect(options[1]).toHaveTextContent('dashboard-favorite-meetings');
  });
  it('renders favorite meetings on user selection', async () => {
    render(<MobileHome />);

    const viewSelector = screen.getByRole('combobox', { name: 'dashboard-meeting-mobile-view-select' });
    await userEvent.click(viewSelector);

    const options = screen.getAllByRole('option');
    await userEvent.click(options[1]);

    expect(screen.getByTestId('favorite-meetings')).toBeInTheDocument();
  });
});
