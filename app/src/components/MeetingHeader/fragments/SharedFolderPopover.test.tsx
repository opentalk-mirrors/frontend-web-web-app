// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, screen } from '@testing-library/react';

import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import { SharedFolderPopover } from './SharedFolderPopover';

describe('SharedFolderPopover rendering logic', () => {
  it('should render MeetingHeaderButton', () => {
    const { store } = configureStore({
      initialState: {
        sharedFolder: {
          opened: true,
          sharedFolderData: {
            read: {},
            readWrite: {},
          },
        },
      },
    });

    renderWithProviders(<SharedFolderPopover />, { store });
    const button = screen.getByRole('button', { name: 'shared-folder-open-label' });
    expect(button).toBeInTheDocument();
  });
});

describe('SharedFolderPopover MenuItem rendering logic', () => {
  it('should not render shared folder MenuItem if url is not provided.', () => {
    const { store } = configureStore({
      initialState: {
        sharedFolder: {
          opened: true,
          sharedFolderData: {
            read: {},
            readWrite: {},
          },
        },
      },
    });
    renderWithProviders(<SharedFolderPopover />, { store });
    expect(screen.queryByRole('menuitem', { name: 'shared-folder-open-label' })).not.toBeInTheDocument();
  });

  it('should not render shared password MenuItem if its not provided.', () => {
    const { store } = configureStore({
      initialState: {
        sharedFolder: {
          opened: true,
          sharedFolderData: {
            read: {},
            readWrite: {},
          },
        },
      },
    });
    renderWithProviders(<SharedFolderPopover />, { store });
    const button = screen.getByRole('button', { name: 'shared-folder-open-label' });
    fireEvent.click(button);
    expect(screen.queryByText('shared-folder-password-label')).not.toBeInTheDocument();
  });

  it('should render shared folder MenuItem if url is provided.', () => {
    const { store } = configureStore({
      initialState: {
        sharedFolder: {
          opened: true,
          sharedFolderData: {
            read: {},
            readWrite: {
              url: 'https://example.com',
              password: 'password',
            },
          },
        },
      },
    });
    renderWithProviders(<SharedFolderPopover />, { store });
    const button = screen.getByRole('button', { name: 'shared-folder-open-label' });
    fireEvent.click(button);
    expect(screen.getByText('shared-folder-open-label')).toBeInTheDocument();
  });

  it('should render shared password MenuItem if its provided.', () => {
    const { store } = configureStore({
      initialState: {
        sharedFolder: {
          opened: true,
          sharedFolderData: {
            read: {},
            readWrite: {
              url: 'https://example.com',
              password: 'password',
            },
          },
        },
      },
    });
    renderWithProviders(<SharedFolderPopover />, { store });

    const button = screen.getByRole('button', { name: 'shared-folder-open-label' });
    fireEvent.click(button);
    expect(screen.getByRole('menuitem', { name: 'shared-folder-password-label', hidden: true })).toBeInTheDocument();
  });
});

describe('SharedFolderMenuItem callback logic', () => {
  let originalWindowOpen: typeof window.open;
  let originalClipboard: typeof navigator.clipboard;

  beforeEach(() => {
    originalWindowOpen = window.open;
    window.open = jest.fn();
    originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: jest.fn(),
      },
      writable: true, // Allow it to be restored
      configurable: true,
    });
  });

  afterEach(() => {
    window.open = originalWindowOpen;
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      writable: true,
      configurable: true,
    });
  });

  it('should call sharedFolderOpened action when clicked on the shared folder menu item.', () => {
    const { store } = configureStore({
      initialState: {
        sharedFolder: {
          opened: true,
          sharedFolderData: {
            read: {
              url: 'https://example.com',
              password: 'password',
            },
            readWrite: {
              url: 'https://example.com',
              password: 'password',
            },
          },
        },
      },
    });
    renderWithProviders(<SharedFolderPopover />, { store });
    const button = screen.getByRole('button', { name: 'shared-folder-open-label' });
    fireEvent.click(button);
    const menuitem = screen.getByRole('menuitem', { name: 'shared-folder-open-label', hidden: true });
    fireEvent.click(menuitem);
    expect(window.open).toHaveBeenCalledWith('https://example.com', 'sharedFolder');
  });

  it('should call clipboard.writeText when clicked on the shared password menu item.', () => {
    const { store } = configureStore({
      initialState: {
        sharedFolder: {
          opened: true,
          sharedFolderData: {
            read: {},
            readWrite: {
              url: 'https://example.com',
              password: 'password',
            },
          },
        },
      },
    });
    renderWithProviders(<SharedFolderPopover />, { store });
    const button = screen.getByRole('button', { name: 'shared-folder-open-label' });
    fireEvent.click(button);
    const menuitem = screen.getByRole('menuitem', { name: 'shared-folder-password-label', hidden: true });
    fireEvent.click(menuitem);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('password');
    expect(window.open).not.toHaveBeenCalled();
  });
});
