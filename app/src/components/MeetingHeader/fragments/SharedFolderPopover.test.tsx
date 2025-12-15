// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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

    renderWithProviders(<SharedFolderPopover />, { store, provider: { mui: true } });
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
    renderWithProviders(<SharedFolderPopover />, { store, provider: { mui: true } });
    expect(screen.queryByRole('menuitem', { name: 'shared-folder-open-label' })).not.toBeInTheDocument();
  });

  it('should not render shared password MenuItem if its not provided.', async () => {
    const user = userEvent.setup();
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
    renderWithProviders(<SharedFolderPopover />, { store, provider: { mui: true } });
    const button = screen.getByRole('button', { name: 'shared-folder-open-label' });

    await user.click(button);

    expect(screen.queryByText('shared-folder-password-label')).not.toBeInTheDocument();
  });

  it('should render shared folder MenuItem if url is provided.', async () => {
    const user = userEvent.setup();
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
    renderWithProviders(<SharedFolderPopover />, { store, provider: { mui: true } });
    const button = screen.getByRole('button', { name: 'shared-folder-open-label' });

    await user.click(button);

    expect(screen.getByText('shared-folder-open-label')).toBeInTheDocument();
  });

  it('should render shared password MenuItem if its provided.', async () => {
    const user = userEvent.setup();
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
    renderWithProviders(<SharedFolderPopover />, { store, provider: { mui: true } });

    const button = screen.getByRole('button', { name: 'shared-folder-open-label' });

    await user.click(button);

    expect(screen.getByRole('menuitem', { name: 'shared-folder-password-label', hidden: true })).toBeInTheDocument();
  });
});

describe('SharedFolderMenuItem callback logic', () => {
  let originalWindowOpen: typeof window.open;

  beforeEach(() => {
    originalWindowOpen = window.open;
    window.open = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.open = originalWindowOpen;
  });

  it('should call sharedFolderOpened action when clicked on the shared folder menu item.', async () => {
    const user = userEvent.setup();
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
    renderWithProviders(<SharedFolderPopover />, { store, provider: { mui: true } });
    const button = screen.getByRole('button', { name: 'shared-folder-open-label' });

    await user.click(button);

    const menuitem = screen.getByRole('menuitem', { name: 'shared-folder-open-label', hidden: true });

    await user.click(menuitem);

    expect(window.open).toHaveBeenCalledExactlyOnceWith('https://example.com', 'sharedFolder');
  });

  it('should call clipboard.writeText when clicked on the shared password menu item.', async () => {
    const user = userEvent.setup();
    const clipboardWriteTextSpy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
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
    renderWithProviders(<SharedFolderPopover />, { store, provider: { mui: true } });
    const button = screen.getByRole('button', { name: 'shared-folder-open-label' });

    await user.click(button);

    const menuitem = screen.getByRole('menuitem', { name: 'shared-folder-password-label', hidden: true });

    await user.click(menuitem);

    expect(clipboardWriteTextSpy).toHaveBeenCalledExactlyOnceWith('password');
    expect(window.open).not.toHaveBeenCalled();
  });
});
