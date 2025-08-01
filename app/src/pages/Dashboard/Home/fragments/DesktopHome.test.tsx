// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen } from '@testing-library/react';

import DesktopHome from './DesktopHome';

vi.mock('./AdhocMeetingButton', () => ({
  ...vi.importActual('./AdhocMeetingButton'),
  __esModule: true,
  default: () => <div data-testid="adhoc-button"></div>,
}));

vi.mock('../../../../components/JoinMeetingDialog', () => ({
  ...vi.importActual('../../../../components/JoinMeetingDialog'),
  __esModule: true,
  default: () => <div data-testid="join-meeting-dialog"></div>,
}));

vi.mock('./NewMeetingButton', () => ({
  ...vi.importActual('./NewMeetingButton'),
  __esModule: true,
  default: () => <div data-testid="new-meeting-button"></div>,
}));

vi.mock('./CurrentMeetings', () => ({
  ...vi.importActual('./CurrentMeetings'),
  __esModule: true,
  default: () => <div data-testid="current-meetings"></div>,
}));

vi.mock('./FavoriteMeetings', () => ({
  ...vi.importActual('./FavoriteMeetings'),
  __esModule: true,
  default: () => <div data-testid="favorite-meetings"></div>,
}));

describe('MobileHome', () => {
  it('renders header and all elements', () => {
    const pageHeading = 'heading';
    render(<DesktopHome pageHeading={pageHeading} />);

    const header = screen.getByRole('heading', { name: pageHeading });
    expect(header).toBeInTheDocument();

    expect(screen.getByTestId('adhoc-button')).toBeInTheDocument();
    expect(screen.getByTestId('join-meeting-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('new-meeting-button')).toBeInTheDocument();
    expect(screen.getByTestId('current-meetings')).toBeInTheDocument();
    expect(screen.getByTestId('favorite-meetings')).toBeInTheDocument();
  });
});
