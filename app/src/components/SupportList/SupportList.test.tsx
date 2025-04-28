// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, render, screen, within } from '@testing-library/react';

import { SupportList } from './SupportList';

jest.mock('react-i18next', () => ({
  ...jest.requireActual('react-i18next'),
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('../../hooks', () => ({
  useAppSelector: (selector: () => unknown) => selector(),
  useLocale: () => ({ code: 'en' }),
}));

jest.mock('../Toolbar/fragments/ShortcutListDialog', () => ({
  __esModule: true,
  default: ({ open }: { open: boolean }) => <div style={{ display: open ? 'block' : 'none' }}>ShortcutListDialog</div>,
}));

const mockSelectIsGlitchtipConfigured = jest.fn();
const mockSelectContactSupportUrl = jest.fn();

jest.mock('../../store/slices/configSlice', () => ({
  selectIsGlitchtipConfigured: () => mockSelectIsGlitchtipConfigured(),
  selectContactSupportUrl: () => mockSelectContactSupportUrl(),
}));

describe('SupportList component', () => {
  it('should render without crashing', () => {
    render(<SupportList />);
    expect.assertions(0);
  });
  describe('children', () => {
    it('renders list with accessibility, user manual, keyboard shortcuts and report a bug elements by default', () => {
      render(<SupportList />);
      const list = screen.getByRole('list');

      expect(list).toBeInTheDocument();
      expect(list.children).toHaveLength(3);
      expect(within(list).getByText('my-meeting-menu-accessibility')).toBeInTheDocument();
      expect(within(list).getByText('my-meeting-menu-user-manual')).toBeInTheDocument();
      expect(within(list).getByText('my-meeting-menu-keyboard-shortcuts')).toBeInTheDocument();
      expect(within(list).queryByText('my-meeting-menu-glitchtip-trigger')).not.toBeInTheDocument();
      expect(within(list).queryByText('my-meeting-menu-support')).not.toBeInTheDocument();
    });
    it('adds glitchtip, if it"s configured', () => {
      mockSelectIsGlitchtipConfigured.mockReturnValue(true);
      render(<SupportList />);
      const list = screen.getByRole('list');

      expect(list).toBeInTheDocument();
      expect(list.children).toHaveLength(4);
      expect(within(list).getByText('my-meeting-menu-accessibility')).toBeInTheDocument();
      expect(within(list).getByText('my-meeting-menu-user-manual')).toBeInTheDocument();
      expect(within(list).getByText('my-meeting-menu-keyboard-shortcuts')).toBeInTheDocument();
      expect(within(list).getByText('my-meeting-menu-glitchtip-trigger')).toBeInTheDocument();
      expect(within(list).queryByText('my-meeting-menu-support')).not.toBeInTheDocument();
    });
    it('adds support, if it"s configured', () => {
      mockSelectContactSupportUrl.mockReturnValue('https://example.com');
      render(<SupportList />);
      const list = screen.getByRole('list');

      expect(list).toBeInTheDocument();
      expect(list.children).toHaveLength(4);
      expect(within(list).getByText('my-meeting-menu-accessibility')).toBeInTheDocument();
      expect(within(list).getByText('my-meeting-menu-user-manual')).toBeInTheDocument();
      expect(within(list).getByText('my-meeting-menu-keyboard-shortcuts')).toBeInTheDocument();
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
    it('renders shortcut list item with open new tab image', () => {
      render(<SupportList />);
      const keyboardShortcut = screen.getAllByRole('listitem')[2];
      const openNewTabImage = within(keyboardShortcut).queryByRole('img', { name: 'global-open-new-tab' });
      expect(openNewTabImage).not.toBeInTheDocument();
    });
  });
  it('should contain option that expands/collapses the shortcut dialog', () => {
    render(<SupportList />);
    const text = screen.getByText('my-meeting-menu-keyboard-shortcuts');
    const button = (text.parentElement as HTMLDivElement).parentElement as HTMLButtonElement;

    expect(button).toBeInTheDocument();
    expect(button).toHaveRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });
  it('should expand shortcut dialog on click', () => {
    render(<SupportList />);
    const dialog = screen.getByText('ShortcutListDialog');
    const text = screen.getByText('my-meeting-menu-keyboard-shortcuts');
    const button = (text.parentElement as HTMLDivElement).parentElement as HTMLButtonElement;

    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(dialog).not.toBeVisible();

    fireEvent.click(button);

    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(dialog).toBeVisible();
  });
  it('should contain option that triggers Glitchtip manually', () => {
    mockSelectIsGlitchtipConfigured.mockReturnValue(true);
    render(<SupportList />);
    const text = screen.getByText('my-meeting-menu-glitchtip-trigger');
    const button = (text.parentElement as HTMLDivElement).parentElement as HTMLButtonElement;

    expect(button).toBeInTheDocument();
    expect(button).toHaveRole('button');
  });
});
