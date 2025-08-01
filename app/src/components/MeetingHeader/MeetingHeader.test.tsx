// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen } from '@testing-library/react';
import { Mock } from 'vitest';

import { useIsMobile } from '../../hooks/useMediaQuery';
import MeetingHeader from './MeetingHeader';

vi.mock('../../hooks/useMediaQuery', () => ({
  __esModule: true,
  useIsMobile: vi.fn(),
}));

vi.mock('./Mobile/MobileMeetingHeader', () => ({
  __esModule: true,
  default: () => <div>Mobile Meeting Header</div>,
}));

vi.mock('./fragments/DesktopMeetingHeader', () => ({
  __esModule: true,
  default: () => <div>Desktop Meeting Header</div>,
}));

describe('MeetingHeader rendering logic', () => {
  it('should render MobileMeetingHeader when isMobile is true', () => {
    (useIsMobile as Mock).mockReturnValue(true);
    render(<MeetingHeader />);
    expect(screen.getByText('Mobile Meeting Header')).toBeInTheDocument();
  });

  it('should render DesktopMeetingHeader when isMobile is false', () => {
    (useIsMobile as Mock).mockReturnValue(false);
    render(<MeetingHeader />);
    expect(screen.getByText('Desktop Meeting Header')).toBeInTheDocument();
  });
});
