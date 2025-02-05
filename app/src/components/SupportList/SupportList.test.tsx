// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, render, screen } from '@testing-library/react';

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

var mockSelectIsGlitchtipConfigured = jest.fn();

jest.mock('../../store/slices/configSlice', () => ({
  selectIsGlitchtipConfigured: () => mockSelectIsGlitchtipConfigured(),
}));

describe('SupportList component', () => {
  it('should render without crashing', async () => {
    render(<SupportList />);
    expect.assertions(0);
  });
  describe('children', () => {
    it('should contain list with two list items when glitchtip is not configured.', () => {
      render(<SupportList />);
      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();
      expect(list.children).toHaveLength(2);
    });
    it('should contain list with two list items', async () => {
      mockSelectIsGlitchtipConfigured.mockReturnValue(true);
      render(<SupportList />);
      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();
      expect(list.children).toHaveLength(3);
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
