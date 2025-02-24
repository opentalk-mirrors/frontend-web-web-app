// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import MobileHome from './MobileHome';

jest.mock('./AdhocMeetingButton', () => ({
  ...jest.requireActual('./AdhocMeetingButton'),
  __esModule: true,
  default: () => <div data-testid="adhoc-button"></div>,
}));

jest.mock('../../../../components/JoinMeetingDialog', () => ({
  ...jest.requireActual('../../../../components/JoinMeetingDialog'),
  __esModule: true,
  default: () => <div data-testid="join-meeting-dialog"></div>,
}));

jest.mock('./NewMeetingButton', () => ({
  ...jest.requireActual('./NewMeetingButton'),
  __esModule: true,
  default: () => <div data-testid="new-meeting-button"></div>,
}));

jest.mock('./CurrentMeetings', () => ({
  ...jest.requireActual('./CurrentMeetings'),
  __esModule: true,
  default: () => <div data-testid="current-meetings"></div>,
}));

jest.mock('./FavoriteMeetings', () => ({
  ...jest.requireActual('./FavoriteMeetings'),
  __esModule: true,
  default: () => <div data-testid="favorite-meetings"></div>,
}));

describe('MobileHome', () => {
  test('renders header buttons', () => {
    render(<MobileHome />);
    expect(screen.getByTestId('adhoc-button')).toBeInTheDocument();
    expect(screen.getByTestId('join-meeting-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('new-meeting-button')).toBeInTheDocument();
  });
  test('renders view selector and current meetings by default', () => {
    render(<MobileHome />);
    const viewSelector = screen.getByRole('combobox', { name: 'dashboard-meeting-mobile-view-select' });
    expect(viewSelector).toBeInTheDocument();
    expect(viewSelector).toHaveTextContent('dashboard-current-meetings');

    const currentMeetingsHeader = screen.getByRole('heading', { name: 'dashboard-current-meetings' });
    expect(currentMeetingsHeader).toBeInTheDocument();

    expect(screen.getByTestId('current-meetings')).toBeInTheDocument();
  });
  test('renders current and favorite options in the view selector menu', async () => {
    render(<MobileHome />);

    const viewSelector = screen.getByRole('combobox', { name: 'dashboard-meeting-mobile-view-select' });
    await userEvent.click(viewSelector);

    const options = screen.getAllByRole('option');
    expect(options.length).toEqual(2);
    expect(options[0]).toHaveTextContent('dashboard-current-meetings');
    expect(options[1]).toHaveTextContent('dashboard-favorite-meetings');
  });
  test('renders favorite meetings on user selection', async () => {
    render(<MobileHome />);

    const viewSelector = screen.getByRole('combobox', { name: 'dashboard-meeting-mobile-view-select' });
    await userEvent.click(viewSelector);

    const options = screen.getAllByRole('option');
    act(() => {
      options[1].click();
    });
    expect(screen.getByTestId('favorite-meetings')).toBeInTheDocument();
  });
});
