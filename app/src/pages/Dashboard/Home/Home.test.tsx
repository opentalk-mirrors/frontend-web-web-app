// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useHeader } from '../../../hooks/useHeader';
import { useIsDesktop } from '../../../hooks/useMediaQuery';
import { useUpdateDocumentTitle } from '../../../hooks/useUpdateDocumentTitle';
import { render, screen, waitFor } from '../../../utils/testUtils';
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

  it('renders desktop view', async () => {
    const isDesktop = true;
    mockUseIsDesktop.mockReturnValue(isDesktop);

    await render(<Home />);

    expect(screen.getByTestId('desktop-home')).toBeInTheDocument();
  });

  it('renders mobile view', async () => {
    const isDesktop = false;
    mockUseIsDesktop.mockReturnValue(isDesktop);

    await render(<Home />);
    expect(screen.getByTestId('mobile-home')).toBeInTheDocument();
  });

  it('updates the document title', async () => {
    await render(<Home />);
    expect(useUpdateDocumentTitle).toHaveBeenCalledWith('dashboard-current-meetings');
  });

  it('renders the banner container into the document header', async () => {
    const mockSetHeader = jest.fn();
    mockUseHeader.mockReturnValue({ setHeader: mockSetHeader });

    await render(<Home />);

    await waitFor(() => {
      expect(mockSetHeader).toHaveBeenCalledWith(<BannerContainer />);
    });
  });
});
