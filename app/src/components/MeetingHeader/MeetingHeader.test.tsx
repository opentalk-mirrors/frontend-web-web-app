// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen } from '@testing-library/react';

import { useIsMobile } from '../../hooks/useMediaQuery';
import MeetingHeader from './MeetingHeader';

jest.mock('../../hooks/useMediaQuery', () => ({
  __esModule: true,
  useIsMobile: jest.fn(),
}));

jest.mock('./Mobile/MobileMeetingHeader', () => ({
  __esModule: true,
  default: () => <div>Mobile Meeting Header</div>,
}));

jest.mock('./fragments/DesktopMeetingHeader', () => ({
  __esModule: true,
  default: () => <div>Desktop Meeting Header</div>,
}));

describe('MeetingHeader rendering logic', () => {
  it('should render MobileMeetingHeader when isMobile is true', () => {
    (useIsMobile as jest.Mock).mockReturnValue(true);
    render(<MeetingHeader />);
    expect(screen.getByText('Mobile Meeting Header')).toBeInTheDocument();
  });

  it('should render DesktopMeetingHeader when isMobile is false', () => {
    (useIsMobile as jest.Mock).mockReturnValue(false);
    render(<MeetingHeader />);
    expect(screen.getByText('Desktop Meeting Header')).toBeInTheDocument();
  });
});
