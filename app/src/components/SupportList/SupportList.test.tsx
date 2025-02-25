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
}));

jest.mock('../Toolbar/fragments/ShortcutListDialog', () => ({
  __esModule: true,
  default: ({ open }: { open: boolean }) => <div style={{ display: open ? 'block' : 'none' }}>ShortcutListDialog</div>,
}));

const mockSelectIsGlitchtipConfigured = jest.fn();

jest.mock('../../store/slices/configSlice', () => ({
  selectIsGlitchtipConfigured: () => mockSelectIsGlitchtipConfigured(),
}));

describe('SupportList component', () => {
  test('should render without crashing', () => {
    render(<SupportList />);
    expect.assertions(0);
  });
  describe('children', () => {
    test('should contain list with two list items when glitchtip is not configured.', () => {
      render(<SupportList />);
      const list = screen.getByRole('list');

      expect(list).toBeInTheDocument();
      expect(list.children).toHaveLength(2);
    });
    test('should contain list with two list items', () => {
      mockSelectIsGlitchtipConfigured.mockReturnValue(true);
      render(<SupportList />);
      const list = screen.getByRole('list');

      expect(list).toBeInTheDocument();
      expect(list.children).toHaveLength(3);
    });
    test('user manual list is containing open new tab image', () => {
      render(<SupportList />);
      const userManual = screen.getAllByRole('listitem')[0];
      const openNewTabImage = within(userManual).getByRole('img', { name: 'global-open-new-tab' });
      expect(openNewTabImage).toBeInTheDocument();
    });
    test('keyboard shortcut list item is not containing open new tab image', () => {
      render(<SupportList />);
      const keyboardShortcut = screen.getAllByRole('listitem')[1];
      const openNewTabImage = within(keyboardShortcut).queryByRole('img', { name: 'global-open-new-tab' });
      expect(openNewTabImage).not.toBeInTheDocument();
    });
  });
  test('should contain option that expands/collapses the shortcut dialog', () => {
    render(<SupportList />);
    const text = screen.getByText('my-meeting-menu-keyboard-shortcuts');
    const button = (text.parentElement as HTMLDivElement).parentElement as HTMLButtonElement;

    expect(button).toBeInTheDocument();
    expect(button).toHaveRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });
  test('should expand shortcut dialog on click', () => {
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
  test('should contain option that triggers Glitchtip manually', () => {
    mockSelectIsGlitchtipConfigured.mockReturnValue(true);
    render(<SupportList />);
    const text = screen.getByText('my-meeting-menu-glitchtip-trigger');
    const button = (text.parentElement as HTMLDivElement).parentElement as HTMLButtonElement;

    expect(button).toBeInTheDocument();
    expect(button).toHaveRole('button');
  });
});
