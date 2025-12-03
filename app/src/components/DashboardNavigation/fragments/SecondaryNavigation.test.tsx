// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useIsDesktop } from '../../../hooks/useMediaQuery';
import { initialState as initialConfigState, type ConfigState } from '../../../store/slices/configSlice';
import { USER_MANUAL_URL } from '../../../utils/apiUtils';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import SecondaryNavigation, { type SecondaryRoute } from './SecondaryNavigation';

vi.mock('../../../hooks/useMediaQuery', () => ({
  useIsDesktop: vi.fn(),
}));

const mockUseIsDesktop = vi.mocked(useIsDesktop);

const defaultRoutes: SecondaryRoute[] = [
  { path: 'general', name: 'dashboard-settings-general' },
  { path: 'imprint', name: 'imprint' },
  { path: 'data-protection', name: 'data-protection' },
  { path: 'support', name: 'support' },
  { path: 'user-manual', name: 'user-manual' },
];

type RenderOptions = {
  isDesktop?: boolean;
  configOverrides?: Partial<ConfigState>;
  routes?: SecondaryRoute[];
  submenu?: string;
  setActiveNavbar?: (value: boolean) => void;
  label?: string;
};

const renderComponent = ({
  isDesktop = true,
  configOverrides = {},
  routes = defaultRoutes,
  submenu = 'settings',
  setActiveNavbar = vi.fn(),
  label = 'dashboard-settings',
}: RenderOptions = {}) => {
  mockUseIsDesktop.mockReturnValue(isDesktop);

  const { store } = configureStore({
    initialState: {
      config: { ...initialConfigState, ...configOverrides },
    },
  });

  renderWithProviders(
    <SecondaryNavigation label={label} routes={routes} submenu={submenu} setActiveNavbar={setActiveNavbar} />,
    { store, provider: { router: true, mui: true } }
  );

  return { setActiveNavbar };
};

describe('SecondaryNavigation', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the section label on desktop', () => {
    renderComponent({ isDesktop: true });

    expect(screen.getByText('dashboard-settings')).toBeInTheDocument();
  });

  it('omits the label on mobile', () => {
    renderComponent({ isDesktop: false });

    expect(screen.queryByText('dashboard-settings')).not.toBeInTheDocument();
  });

  it('renders available routes with correct targets and hrefs', () => {
    renderComponent({
      configOverrides: {
        imprintUrl: 'https://example.com/imprint',
        dataProtectionUrl: 'https://example.com/privacy',
        helpdeskUrl: 'https://example.com/support',
      },
    });

    expect(screen.getAllByTestId('SecondaryNavItem')).toHaveLength(defaultRoutes.length);

    const internalLink = screen.getByRole('link', { name: 'dashboard-settings-general' });
    expect(internalLink).toHaveAttribute('target', '_self');
    expect(internalLink?.getAttribute('href')).toContain('/settings/general');
    expect(internalLink).toHaveAttribute('aria-controls', 'main-content-dashboard');

    const imprintLink = screen.getByRole('link', { name: 'imprint' });
    expect(imprintLink).toHaveAttribute('target', '_blank');
    expect(imprintLink).toHaveAttribute('href', 'https://example.com/imprint');
    expect(imprintLink).not.toHaveAttribute('aria-controls');

    const dataProtectionLink = screen.getByRole('link', { name: 'data-protection' });
    expect(dataProtectionLink).toHaveAttribute('target', '_blank');
    expect(dataProtectionLink).toHaveAttribute('href', 'https://example.com/privacy');

    const supportLink = screen.getByRole('link', { name: 'support' });
    expect(supportLink).toHaveAttribute('target', '_blank');
    expect(supportLink).toHaveAttribute('href', 'https://example.com/support');

    const manualLink = screen.getByRole('link', { name: 'user-manual' });
    expect(manualLink).toHaveAttribute('target', '_blank');
    expect(manualLink).toHaveAttribute('href', USER_MANUAL_URL);
  });

  it('omits external entries without configured urls', () => {
    renderComponent({
      configOverrides: {
        imprintUrl: undefined,
        dataProtectionUrl: undefined,
        helpdeskUrl: undefined,
      },
    });

    expect(screen.getByText('dashboard-settings-general')).toBeInTheDocument();
    expect(screen.getByText('user-manual')).toBeInTheDocument();
    expect(screen.queryByText('imprint')).not.toBeInTheDocument();
    expect(screen.queryByText('data-protection')).not.toBeInTheDocument();
    expect(screen.queryByText('support')).not.toBeInTheDocument();
  });

  it('closes the navbar on mobile after selecting a route', async () => {
    const user = userEvent.setup();
    const { setActiveNavbar } = renderComponent({ isDesktop: false });

    await user.click(screen.getAllByTestId('SecondaryNavItem')[0]);

    expect(setActiveNavbar).toHaveBeenCalledWith(false);
  });

  it('keeps the navbar open on desktop after selection', async () => {
    const user = userEvent.setup();
    const { setActiveNavbar } = renderComponent({ isDesktop: true });

    await user.click(screen.getAllByTestId('SecondaryNavItem')[0]);

    expect(setActiveNavbar).not.toHaveBeenCalled();
  });
});
