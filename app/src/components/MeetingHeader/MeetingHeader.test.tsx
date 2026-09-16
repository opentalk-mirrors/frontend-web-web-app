// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen } from '@testing-library/react';
import { Mock } from 'vitest';

import useConferenceUiVersion from '../../hooks/useConferenceUiVersion';
import { useIsMobile } from '../../hooks/useMediaQuery';
import MeetingHeader from './MeetingHeader';

vi.mock('../../hooks/useMediaQuery', () => ({
  __esModule: true,
  useIsMobile: vi.fn(),
}));

vi.mock('../../hooks/useConferenceUiVersion', () => ({
  __esModule: true,
  default: vi.fn(),
}));

vi.mock('./Mobile/MobileMeetingHeader', () => ({
  __esModule: true,
  default: () => <div>Mobile Meeting Header</div>,
}));

vi.mock('./fragments/DesktopMeetingHeader', () => ({
  __esModule: true,
  default: () => <div>Desktop Meeting Header</div>,
}));

vi.mock('./fragments/DesktopMeetingHeaderLegacy', () => ({
  __esModule: true,
  default: () => <div>Desktop Meeting Header Legacy</div>,
}));

describe('MeetingHeader rendering logic', () => {
  it('should render MobileMeetingHeader when isMobile is true', () => {
    (useIsMobile as Mock).mockReturnValue(true);
    (useConferenceUiVersion as Mock).mockReturnValue({ isV2: false });
    render(<MeetingHeader />);
    expect(screen.getByText('Mobile Meeting Header')).toBeInTheDocument();
  });

  it('should render MobileMeetingHeader on mobile even when v2 is active', () => {
    (useIsMobile as Mock).mockReturnValue(true);
    (useConferenceUiVersion as Mock).mockReturnValue({ isV2: true });
    render(<MeetingHeader />);
    expect(screen.getByText('Mobile Meeting Header')).toBeInTheDocument();
  });

  it('should render the legacy desktop header when isMobile is false and v2 is inactive', () => {
    (useIsMobile as Mock).mockReturnValue(false);
    (useConferenceUiVersion as Mock).mockReturnValue({ isV2: false });
    render(<MeetingHeader />);
    expect(screen.getByText('Desktop Meeting Header Legacy')).toBeInTheDocument();
  });

  it('should render the new desktop header when isMobile is false and v2 is active', () => {
    (useIsMobile as Mock).mockReturnValue(false);
    (useConferenceUiVersion as Mock).mockReturnValue({ isV2: true });
    render(<MeetingHeader />);
    expect(screen.getByText('Desktop Meeting Header')).toBeInTheDocument();
  });
});
