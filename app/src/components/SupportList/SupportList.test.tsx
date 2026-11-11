// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DEFAULT_USER_MANUAL_URL } from '../../utils/apiUtils';
import { SupportList } from './SupportList';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('../../hooks', () => ({
  useAppSelector: (selector: () => unknown) => selector(),
  useLocale: () => ({ code: mockLocale }),
}));

vi.mock('../Toolbar/fragments/HotkeyDialog', () => ({
  __esModule: true,
  default: ({ open }: { open: boolean }) => <div style={{ display: open ? 'block' : 'none' }}>HotkeyDialog</div>,
}));

const mockSelectIsGlitchtipConfigured = vi.fn();
const mockSelectContactSupportUrl = vi.fn();
const mockSelectUserManualUrl = vi.fn();
const mockSelectAccessibilityUrlEn = vi.fn();
const mockSelectAccessibilityUrlDe = vi.fn();
let mockLocale = 'en';

vi.mock('../../store/slices/configSlice', () => ({
  selectIsGlitchtipConfigured: () => mockSelectIsGlitchtipConfigured(),
  selectContactSupportUrl: () => mockSelectContactSupportUrl(),
  selectUserManualUrl: () => mockSelectUserManualUrl(),
  selectAccessibilityUrlEn: () => mockSelectAccessibilityUrlEn(),
  selectAccessibilityUrlDe: () => mockSelectAccessibilityUrlDe(),
}));

describe('SupportList', () => {
  beforeEach(() => {
    mockSelectUserManualUrl.mockReturnValue(DEFAULT_USER_MANUAL_URL);
    mockLocale = 'en';
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.restoreAllMocks();
  });

  it('should render without crashing', () => {
    render(<SupportList />);
    expect.assertions(0);
  });
  describe('children', () => {
    it('renders list with accessibility, user manual, keyboard hotkeys and report a bug elements by default', () => {
      render(<SupportList />);
      const list = screen.getByRole('list');

      expect(list).toBeInTheDocument();
      expect(within(list).getByText('my-meeting-menu-accessibility')).toBeInTheDocument();
      expect(within(list).getByText('my-meeting-menu-user-manual')).toBeInTheDocument();
      expect(within(list).getByText('my-meeting-menu-keyboard-hotkeys')).toBeInTheDocument();
      expect(within(list).queryByText('my-meeting-menu-glitchtip-trigger')).not.toBeInTheDocument();
      expect(within(list).queryByText('my-meeting-menu-support')).not.toBeInTheDocument();
    });
    it('adds glitchtip, if it"s configured', () => {
      mockSelectIsGlitchtipConfigured.mockReturnValue(true);
      render(<SupportList />);
      const list = screen.getByRole('list');

      expect(list).toBeInTheDocument();
      expect(within(list).getByText('my-meeting-menu-accessibility')).toBeInTheDocument();
      expect(within(list).getByText('my-meeting-menu-user-manual')).toBeInTheDocument();
      expect(within(list).getByText('my-meeting-menu-keyboard-hotkeys')).toBeInTheDocument();
      expect(within(list).getByText('my-meeting-menu-glitchtip-trigger')).toBeInTheDocument();
      expect(within(list).queryByText('my-meeting-menu-support')).not.toBeInTheDocument();
    });
    it('adds support, if it"s configured', () => {
      mockSelectContactSupportUrl.mockReturnValue('https://example.com');
      render(<SupportList />);
      const list = screen.getByRole('list');

      expect(list).toBeInTheDocument();
      expect(within(list).getByText('my-meeting-menu-accessibility')).toBeInTheDocument();
      expect(within(list).getByText('my-meeting-menu-user-manual')).toBeInTheDocument();
      expect(within(list).getByText('my-meeting-menu-keyboard-hotkeys')).toBeInTheDocument();
      expect(within(list).queryByText('my-meeting-menu-glitchtip-trigger')).not.toBeInTheDocument();
      expect(within(list).getByText('my-meeting-menu-support')).toBeInTheDocument();
    });
    it('renders accessibility support list item with open new tab image', () => {
      render(<SupportList />);
      const accessibilitySupport = screen.getAllByRole('listitem')[0];
      const openNewTabImage = within(accessibilitySupport).getByRole('img', { name: 'global-open-new-tab' });
      expect(openNewTabImage).toBeInTheDocument();
    });
    it('renders user manual list item with open new tab image', () => {
      render(<SupportList />);
      const userManual = screen.getAllByRole('listitem')[1];
      const openNewTabImage = within(userManual).getByRole('img', { name: 'global-open-new-tab' });
      expect(openNewTabImage).toBeInTheDocument();
    });
    it('renders hotkey list item with open new tab image', () => {
      render(<SupportList />);
      const keyboardHotkeys = screen.getAllByRole('listitem')[2];
      const openNewTabImage = within(keyboardHotkeys).queryByRole('img', { name: 'global-open-new-tab' });
      expect(openNewTabImage).not.toBeInTheDocument();
    });
  });
  it('should contain user manual proper link', () => {
    render(<SupportList />);
    const link = screen.getByRole('link', { name: 'my-meeting-menu-user-manual global-open-new-tab' });

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', DEFAULT_USER_MANUAL_URL);
  });
  describe.each([false, true])('configured links with menu=%s', (menu) => {
    it('opens the configured user manual in a new tab', async () => {
      const user = userEvent.setup();
      const open = vi.spyOn(window, 'open').mockImplementation(() => null);
      const url = 'https://example.com/manual';
      mockSelectUserManualUrl.mockReturnValue(url);
      render(<SupportList menu={menu} />);

      const item = screen.getByRole(menu ? 'menuitem' : 'link', {
        name: 'my-meeting-menu-user-manual global-open-new-tab',
      });
      expect(item).toHaveAttribute('href', url);
      expect(item).toHaveAttribute('target', '_blank');

      await user.click(item);

      expect(open).toHaveBeenCalledExactlyOnceWith(url, '_blank');
    });

    it.each([
      ['de', 'https://example.com/accessibility/de'],
      ['en', 'https://example.com/accessibility/en'],
      ['fr', 'https://example.com/accessibility/en'],
    ])('opens the configured accessibility statement for %s in a new tab', async (locale, url) => {
      const user = userEvent.setup();
      const open = vi.spyOn(window, 'open').mockImplementation(() => null);
      mockLocale = locale;
      mockSelectAccessibilityUrlEn.mockReturnValue('https://example.com/accessibility/en');
      mockSelectAccessibilityUrlDe.mockReturnValue('https://example.com/accessibility/de');
      render(<SupportList menu={menu} />);

      const item = screen.getByRole(menu ? 'menuitem' : 'link', {
        name: 'my-meeting-menu-accessibility global-open-new-tab',
      });
      expect(item).toHaveAttribute('href', url);
      expect(item).toHaveAttribute('target', '_blank');

      await user.click(item);

      expect(open).toHaveBeenCalledExactlyOnceWith(url, '_blank');
    });
  });

  it('should contain option that expands/collapses the hotkey dialog', () => {
    render(<SupportList />);
    const button = screen.getByRole('button', { name: 'my-meeting-menu-keyboard-hotkeys' });

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });
  it('should expand hotkey dialog on click', () => {
    render(<SupportList />);
    const dialog = screen.getByText('HotkeyDialog');
    const button = screen.getByRole('button', { name: 'my-meeting-menu-keyboard-hotkeys' });

    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(dialog).not.toBeVisible();

    fireEvent.click(button);

    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(dialog).toBeVisible();
  });
  it('should contain option that triggers Glitchtip manually', () => {
    mockSelectIsGlitchtipConfigured.mockReturnValue(true);
    render(<SupportList />);
    const button = screen.getByRole('button', { name: 'my-meeting-menu-glitchtip-trigger' });
    expect(button).toBeInTheDocument();
  });
});
