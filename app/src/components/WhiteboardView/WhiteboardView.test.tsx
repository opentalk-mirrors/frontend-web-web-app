// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';

import { MeetingNotesAccess, ParticipationKind, Role } from '../../types';
import { configureStore, renderWithProviders } from '../../utils/testUtils';
import WhiteboardView from './WhiteboardView';

const { excalidrawApiMock, createAssetMock, getCurrentConferenceRoomMock, sendMessageMock, restrictionsDialogMock } =
  vi.hoisted(() => ({
    excalidrawApiMock: {
      getAppState: vi.fn(() => ({ collaborators: new Map(), exportBackground: false })),
      getSceneElements: vi.fn(() => []),
      getSceneElementsIncludingDeleted: vi.fn(() => []),
      getFiles: vi.fn(() => ({})),
      updateScene: vi.fn(),
      onUserFollow: vi.fn(),
      onScrollChange: vi.fn(),
    },
    createAssetMock: vi.fn(),
    getCurrentConferenceRoomMock: vi.fn(),
    sendMessageMock: vi.fn(),
    restrictionsDialogMock: vi.fn(),
  }));

vi.mock('../../commonComponents', () => ({
  notifications: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../../api/rest', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../api/rest')>();

  return {
    ...actual,
    useCreateRoomAssetMutation: () => [createAssetMock, { error: undefined }],
  };
});

vi.mock('../../api/types/outgoing/common', () => ({
  sendMessage: sendMessageMock,
}));

vi.mock('../../modules/WebRTC/ConferenceRoom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../modules/WebRTC/ConferenceRoom')>();

  return {
    ...actual,
    getCurrentConferenceRoom: getCurrentConferenceRoomMock,
  };
});

vi.mock('./fragments/RestrictionsDialog', () => ({
  default: Object.assign(
    ({ open, onClose }: { open: boolean; onClose: () => void }) => {
      restrictionsDialogMock({ open, onClose });

      if (!open) {
        return null;
      }

      return (
        <div data-testid="restrictions-dialog">
          <button onClick={onClose}>close-restrictions-dialog</button>
        </div>
      );
    },
    { displayName: 'MockRestrictionsDialog' }
  ),
}));

vi.mock('@excalidraw/excalidraw', () => {
  const MockMainMenu = ({ children }: { children: ReactNode }) => <div data-testid="main-menu">{children}</div>;
  MockMainMenu.displayName = 'MockMainMenu';

  const MockMainMenuItem = ({
    children,
    onSelect,
    disabled,
  }: {
    children: ReactNode;
    onSelect?: () => void;
    disabled?: boolean;
  }) => (
    <button disabled={disabled} onClick={onSelect}>
      {children}
    </button>
  );
  MockMainMenuItem.displayName = 'MockMainMenuItem';

  const MockMainMenuSeparator = () => <hr />;
  MockMainMenuSeparator.displayName = 'MockMainMenuSeparator';

  MockMainMenu.Item = MockMainMenuItem;
  MockMainMenu.Separator = MockMainMenuSeparator;
  MockMainMenu.DefaultItems = {
    ClearCanvas: () => <button>ClearCanvas</button>,
    ToggleTheme: () => <button>ToggleTheme</button>,
    ChangeCanvasBackground: () => <button>ChangeCanvasBackground</button>,
  };

  return {
    Excalidraw: Object.assign(
      ({
        excalidrawAPI,
        children,
        viewModeEnabled,
        UIOptions,
      }: {
        excalidrawAPI?: (api: typeof excalidrawApiMock) => void;
        children: ReactNode;
        viewModeEnabled?: boolean;
        UIOptions?: { tools?: { image?: boolean } };
      }) => {
        excalidrawAPI?.(excalidrawApiMock);

        return (
          <div
            data-image-tool-disabled={String(UIOptions?.tools?.image === false)}
            data-testid="excalidraw"
            data-view-mode-enabled={String(viewModeEnabled)}
          >
            {children}
          </div>
        );
      },
      { displayName: 'MockExcalidraw' }
    ),
    MainMenu: MockMainMenu,
    exportToSvg: vi
      .fn()
      .mockResolvedValue(
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PC9zdmc+'
      ),
    restoreElements: vi.fn((remoteElements) => remoteElements),
    reconcileElements: vi.fn((localElements, restoredElements) => restoredElements ?? localElements),
    hashElementsVersion: vi.fn((elements: Array<unknown>) => elements.length),
    CaptureUpdateAction: {
      NEVER: 'never',
    },
  };
});

const renderWhiteboardView = ({
  isModerator = false,
  editRestrictionsEnabled = false,
}: {
  isModerator?: boolean;
  editRestrictionsEnabled?: boolean;
} = {}) => {
  const { store, dispatchSpy } = configureStore({
    initialState: {
      user: {
        uuid: null,
        displayName: 'Current User',
        role: isModerator ? Role.Moderator : Role.User,
        participationKind: ParticipationKind.Registered,
        meetingNotesAccess: MeetingNotesAccess.None,
        isRoomOwner: false,
      },
      room: {
        roomId: 'room-1',
      },
      whiteboard: {
        isWhiteboardAvailable: true,
        whiteboardAssetList: [],
        scene: {
          elements: [],
          appState: undefined,
        },
        editRestrictions: {
          enabled: editRestrictionsEnabled,
          unrestrictedParticipants: [],
        },
        collaborators: {},
        remoteRevision: 0,
      },
    },
  });

  const view = renderWithProviders(<WhiteboardView />, { store, provider: { mui: true } });
  dispatchSpy.mockClear();
  restrictionsDialogMock.mockClear();

  return { ...view, dispatchSpy };
};

describe('WhiteboardView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentConferenceRoomMock.mockReturnValue(undefined);
  });

  it('renders excalidraw in edit mode when the user may edit', () => {
    renderWhiteboardView();

    expect(screen.getByTestId('excalidraw')).toHaveAttribute('data-view-mode-enabled', 'false');
    expect(screen.getByTestId('excalidraw')).toHaveAttribute('data-image-tool-disabled', 'true');
  });

  it('renders excalidraw in view mode when edit restrictions block the user', () => {
    renderWhiteboardView({ editRestrictionsEnabled: true });

    expect(screen.getByTestId('excalidraw')).toHaveAttribute('data-view-mode-enabled', 'true');
  });

  it('hides the restrictions menu item for non moderators', () => {
    renderWhiteboardView({ isModerator: false });

    expect(screen.queryByRole('button', { name: 'whiteboard-edit-restrictions-menu-item' })).not.toBeInTheDocument();
  });

  it('shows the restrictions menu item for moderators', () => {
    renderWhiteboardView({ isModerator: true });

    expect(screen.getByRole('button', { name: 'whiteboard-edit-restrictions-menu-item' })).toBeInTheDocument();
  });

  it('opens and closes the restrictions dialog from the moderator menu item', async () => {
    const user = userEvent.setup();
    renderWhiteboardView({ isModerator: true });

    expect(screen.queryByTestId('restrictions-dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'whiteboard-edit-restrictions-menu-item' }));

    expect(screen.getByTestId('restrictions-dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'close-restrictions-dialog' }));

    expect(screen.queryByTestId('restrictions-dialog')).not.toBeInTheDocument();
  });

  it('registers and unregisters the whiteboard message listener on the conference room', () => {
    const room = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    getCurrentConferenceRoomMock.mockReturnValue(room);

    const { unmount } = renderWhiteboardView();

    expect(room.addEventListener).toHaveBeenCalledWith('message', expect.any(Function));

    const registeredHandler = room.addEventListener.mock.calls[0][1];

    unmount();

    expect(room.removeEventListener).toHaveBeenCalledWith('message', registeredHandler);
  });
});
