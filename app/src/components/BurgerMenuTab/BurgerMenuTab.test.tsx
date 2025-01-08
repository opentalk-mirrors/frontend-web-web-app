// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, render, screen } from '@testing-library/react';

import BurgerMenuTab from './BurgerMenuTab';

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

var mockSelectIsGlitchtipConfigured = jest.fn();

jest.mock('../../store/slices/configSlice', () => ({
  selectIsGlitchtipConfigured: () => mockSelectIsGlitchtipConfigured(),
}));

describe('BurgerMenuTab component', () => {
  it('should render without crashing', async () => {
    render(<BurgerMenuTab />);
    expect.assertions(0);
  });
  describe('children', () => {
    it('should contain list with two list items when glitchtip is not configured.', () => {
      render(<BurgerMenuTab />);
      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();
      expect(list.children).toHaveLength(2);
    });
    it('should contain list with two list items', async () => {
      mockSelectIsGlitchtipConfigured.mockReturnValue(true);
      render(<BurgerMenuTab />);
      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();
      expect(list.children).toHaveLength(3);
    });
  });
  it('should contain option that expands/collapses the shortcut dialog', () => {
    render(<BurgerMenuTab />);
    const button = screen.getByText('my-meeting-menu-keyboard-shortcuts');
    expect(button).toBeInTheDocument();
    expect(button).toHaveRole('listitem');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });
  it('should expand shortcut dialog on click', () => {
    render(<BurgerMenuTab />);
    const dialog = screen.getByText('ShortcutListDialog');
    const button = screen.getByText('my-meeting-menu-keyboard-shortcuts');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(dialog).not.toBeVisible();
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(dialog).toBeVisible();
  });
  it('should contain option that triggers Glitchtip manually', () => {
    mockSelectIsGlitchtipConfigured.mockReturnValue(true);
    render(<BurgerMenuTab />);
    const button = screen.getByText('my-meeting-menu-glitchtip-trigger');
    expect(button).toBeInTheDocument();
    expect(button).toHaveRole('listitem');
  });
});
