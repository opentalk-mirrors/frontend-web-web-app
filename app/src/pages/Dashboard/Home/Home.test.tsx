// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen } from '@testing-library/react';

import { useHeader } from '../../../hooks/useHeader';
import { useIsDesktop } from '../../../hooks/useMediaQuery';
import { useUpdateDocumentTitle } from '../../../hooks/useUpdateDocumentTitle';
import Home from './Home';
import BannerContainer from './fragments/BannerContainer';

jest.mock('./fragments/DesktopHome', () => ({
  ...jest.requireActual('./fragments/DesktopHome'),
  __esModule: true,
  default: () => <div data-testid="desktop-home"></div>,
}));

jest.mock('./fragments/MobileHome', () => ({
  ...jest.requireActual('./fragments/MobileHome'),
  __esModule: true,
  default: () => <div data-testid="mobile-home"></div>,
}));

jest.mock('../../../hooks/useMediaQuery', () => ({
  useIsDesktop: jest.fn(),
}));
const mockUseIsDesktop = useIsDesktop as jest.Mock;

jest.mock('../../../hooks/useUpdateDocumentTitle', () => ({
  useUpdateDocumentTitle: jest.fn(),
}));

jest.mock('../../../hooks/useHeader', () => ({
  useHeader: jest.fn(),
}));
const mockUseHeader = useHeader as jest.Mock;

describe('Home', () => {
  beforeEach(() => mockUseHeader.mockReturnValue({ setHeader: jest.fn() }));

  test('renders desktop view', () => {
    const isDesktop = true;
    mockUseIsDesktop.mockReturnValue(isDesktop);

    render(<Home />);

    expect(screen.getByTestId('desktop-home')).toBeInTheDocument();
  });

  test('renders mobile view', () => {
    const isDesktop = false;
    mockUseIsDesktop.mockReturnValue(isDesktop);

    render(<Home />);
    expect(screen.getByTestId('mobile-home')).toBeInTheDocument();
  });

  test('updates the document title', () => {
    render(<Home />);
    expect(useUpdateDocumentTitle).toHaveBeenCalledWith('dashboard-current-meetings');
  });

  test('renders the banner container into the document header', () => {
    const mockSetHeader = jest.fn();
    mockUseHeader.mockReturnValue({ setHeader: mockSetHeader });

    render(<Home />);

    expect(mockSetHeader).toHaveBeenCalledWith(<BannerContainer />);
  });
});
