// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen } from '@testing-library/react';

import { useIsMobile } from '../../hooks/useMediaQuery';
import MeetingSettingsDialog from './MeetingSettingsDialog';

jest.mock('./fragments/DesktopDialogContent', () => ({
  ...jest.requireActual('./fragments/DesktopDialogContent'),
  __esModule: true,
  default: () => <div data-testid="desktop-dialog-content"></div>,
}));

jest.mock('./fragments/MobileDialogContent', () => ({
  ...jest.requireActual('./fragments/MobileDialogContent'),
  __esModule: true,
  default: () => <div data-testid="mobile-dialog-content"></div>,
}));

jest.mock('../../hooks/useMediaQuery', () => ({
  useIsMobile: jest.fn(),
}));
const mockUseIsMobile = useIsMobile as jest.Mock;

describe('MeetingSettingsDialog', () => {
  it('renders the desktop variant of the dialog', () => {
    const isMobile = false;
    mockUseIsMobile.mockReturnValue(isMobile);

    render(<MeetingSettingsDialog open={true} onClose={jest.fn()} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    const desktopDialogContent = screen.getByTestId('desktop-dialog-content');
    expect(desktopDialogContent).toBeInTheDocument();
  });
  it('renders the mobile variant of the dialog', () => {
    const isMobile = true;
    mockUseIsMobile.mockReturnValue(isMobile);

    render(<MeetingSettingsDialog open={true} onClose={jest.fn()} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    const mobileDialogContent = screen.getByTestId('mobile-dialog-content');
    expect(mobileDialogContent).toBeInTheDocument();
  });
});
