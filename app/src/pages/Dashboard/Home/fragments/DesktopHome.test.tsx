// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { renderWithProviders } from '../../../../utils/testUtils';
import DesktopHome from './DesktopHome';

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
  it('renders header and all elements', () => {
    const pageHeading = 'heading';
    renderWithProviders(<DesktopHome pageHeading={pageHeading} />, { provider: { mui: true } });

    const header = screen.getByRole('heading', { name: pageHeading });
    expect(header).toBeInTheDocument();

    expect(screen.getByTestId('adhoc-button')).toBeInTheDocument();
    expect(screen.getByTestId('join-meeting-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('new-meeting-button')).toBeInTheDocument();
    expect(screen.getByTestId('current-meetings')).toBeInTheDocument();
    expect(screen.getByTestId('favorite-meetings')).toBeInTheDocument();
  });
});
