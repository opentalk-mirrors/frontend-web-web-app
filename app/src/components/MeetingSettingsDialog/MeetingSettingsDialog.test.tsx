// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import { Mock } from 'vitest';

import { useIsMobile } from '../../hooks/useMediaQuery';
import { configureStore, renderWithProviders } from '../../utils/testUtils';
import MeetingSettingsDialog from './MeetingSettingsDialog';

vi.mock('./fragments/DesktopDialogContent', () => ({
  ...vi.importActual('./fragments/DesktopDialogContent'),
  __esModule: true,
  default: () => <div data-testid="desktop-dialog-content"></div>,
}));

vi.mock('./fragments/MobileDialogContent', () => ({
  ...vi.importActual('./fragments/MobileDialogContent'),
  __esModule: true,
  default: () => <div data-testid="mobile-dialog-content"></div>,
}));

vi.mock('../../hooks/useMediaQuery', () => ({
  useIsMobile: vi.fn(),
}));
const mockUseIsMobile = useIsMobile as Mock;

describe('MeetingSettingsDialog', () => {
  it('renders the desktop variant of the dialog', () => {
    const { store } = configureStore();
    const isMobile = false;
    mockUseIsMobile.mockReturnValue(isMobile);

    renderWithProviders(<MeetingSettingsDialog open={true} onClose={vi.fn()} />, { store });
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    const desktopDialogContent = screen.getByTestId('desktop-dialog-content');
    expect(desktopDialogContent).toBeInTheDocument();
  });
  it('renders the mobile variant of the dialog', () => {
    const { store } = configureStore();
    const isMobile = true;
    mockUseIsMobile.mockReturnValue(isMobile);

    renderWithProviders(<MeetingSettingsDialog open={true} onClose={vi.fn()} />, { store });
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    const mobileDialogContent = screen.getByTestId('mobile-dialog-content');
    expect(mobileDialogContent).toBeInTheDocument();
  });
});
