// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import { Mock } from 'vitest';

import useConferenceUiVersion from '../../../hooks/useConferenceUiVersion';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import DesktopInnerLayout from './DesktopInnerLayout';

vi.mock('../../../hooks/useConferenceUiVersion', () => ({
  __esModule: true,
  default: vi.fn(),
}));

vi.mock('./DesktopInnerLayoutLegacy', () => ({
  __esModule: true,
  default: () => <div data-testid="desktop-inner-layout-legacy" />,
}));

// Keep the tree light: assert on the shared shells without pulling their heavy subtrees.
vi.mock('../../MeetingSidebar', () => ({
  __esModule: true,
  default: () => <div data-testid="meeting-sidebar" />,
}));
vi.mock('../../MeetingFooter', () => ({
  __esModule: true,
  default: () => <div data-testid="meeting-footer" />,
}));
vi.mock('../../MeetingHeader', () => ({
  __esModule: true,
  default: () => <div data-testid="meeting-header" />,
}));
vi.mock('./Cinema', () => ({
  __esModule: true,
  default: () => <div data-testid="cinema" />,
}));
vi.mock('../../Ballot', () => ({
  __esModule: true,
  default: () => null,
}));
vi.mock('../../JumpLinkContainer', () => ({
  __esModule: true,
  default: () => null,
}));
vi.mock('../../CoffeeBreakView', () => ({
  __esModule: true,
  default: () => null,
}));

const renderDesktopInnerLayout = () => {
  const { store } = configureStore();
  return renderWithProviders(<DesktopInnerLayout />, { store });
};

describe('DesktopInnerLayout ui-version branching', () => {
  it('renders the legacy layout when v2 is not active', () => {
    (useConferenceUiVersion as Mock).mockReturnValue({ isV2: false });

    renderDesktopInnerLayout();

    expect(screen.getByTestId('desktop-inner-layout-legacy')).toBeInTheDocument();
    expect(screen.queryByTestId('meeting-footer')).not.toBeInTheDocument();
  });

  it('renders the new layout with a footer when v2 is active', () => {
    (useConferenceUiVersion as Mock).mockReturnValue({ isV2: true });

    renderDesktopInnerLayout();

    expect(screen.getByTestId('meeting-footer')).toBeInTheDocument();
    expect(screen.queryByTestId('desktop-inner-layout-legacy')).not.toBeInTheDocument();
  });
});
