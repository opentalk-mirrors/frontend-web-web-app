// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen } from '@testing-library/react';
import { Mock } from 'vitest';

import { useHeader } from '../../../hooks/useHeader';
import { useIsDesktop } from '../../../hooks/useMediaQuery';
import { useUpdateDocumentTitle } from '../../../hooks/useUpdateDocumentTitle';
import Home from './Home';
import BannerContainer from './fragments/BannerContainer';

vi.mock('./fragments/DesktopHome', () => ({
  ...vi.importActual('./fragments/DesktopHome'),
  __esModule: true,
  default: () => <div data-testid="desktop-home"></div>,
}));

vi.mock('./fragments/MobileHome', () => ({
  ...vi.importActual('./fragments/MobileHome'),
  __esModule: true,
  default: () => <div data-testid="mobile-home"></div>,
}));

vi.mock('../../../hooks/useMediaQuery', () => ({
  useIsDesktop: vi.fn(),
}));
const mockUseIsDesktop = useIsDesktop as Mock;

vi.mock('../../../hooks/useUpdateDocumentTitle', () => ({
  useUpdateDocumentTitle: vi.fn(),
}));

vi.mock('../../../hooks/useHeader', () => ({
  useHeader: vi.fn(),
}));
const mockUseHeader = useHeader as Mock;

describe('Home', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockUseHeader.mockReturnValue({ setHeader: vi.fn() });
  });

  it('renders desktop view', () => {
    const isDesktop = true;
    mockUseIsDesktop.mockReturnValue(isDesktop);

    render(<Home />);

    expect(screen.getByTestId('desktop-home')).toBeInTheDocument();
  });

  it('renders mobile view', () => {
    const isDesktop = false;
    mockUseIsDesktop.mockReturnValue(isDesktop);

    render(<Home />);
    expect(screen.getByTestId('mobile-home')).toBeInTheDocument();
  });

  it('updates the document title', () => {
    render(<Home />);
    expect(useUpdateDocumentTitle).toHaveBeenCalledExactlyOnceWith('dashboard-current-meetings');
  });

  it('renders the banner container into the document header', () => {
    const mockSetHeader = vi.fn();
    mockUseHeader.mockReturnValue({ setHeader: mockSetHeader });

    render(<Home />);

    expect(mockSetHeader).toHaveBeenCalledExactlyOnceWith(<BannerContainer />);
  });
});
