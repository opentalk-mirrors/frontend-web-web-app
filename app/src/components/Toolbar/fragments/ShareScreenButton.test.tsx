// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { TrackSource } from '@livekit/protocol';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { switchScreenShare } from '../../../store/commonActions';
import { Role } from '../../../types';
import { renderWithProviders, configureStore } from '../../../utils/testUtils';
import ShareScreenButton from './ShareScreenButton';

const mockUseLocalParticipantPermissions = vi.fn();
vi.mock('@livekit/components-react', () => ({
  useTrackToggle: () => ({
    toggle: vi.fn(),
    enabled: true,
    pending: false,
  }),
  useLocalParticipantPermissions: () => mockUseLocalParticipantPermissions(),
}));

vi.mock('./ToolbarButton', () => ({
  __esModule: true,
  default: (props: { disabled: boolean; hasContext: boolean; openMenu: () => void }) => (
    <>
      <button type="button" disabled={props.disabled}>
        Sharescreen
      </button>
      {props.hasContext && (
        <button type="button" onClick={props.openMenu}>
          Chevron
        </button>
      )}
    </>
  ),
}));

vi.mock('../../../store/commonActions', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../store/commonActions')>();
  return {
    ...actual,
    switchScreenShare: Object.assign(
      vi.fn(() => ({ type: 'livekit/switchScreenShare/mocked' })),
      actual.switchScreenShare
    ),
  };
});

describe('<ShareScreenButton />', () => {
  const sharescreenActiveState = {
    user: {
      role: Role.Moderator,
    },
    livekit: {
      unavailable: false,
      mediaSettings: {
        screenShareEnabled: true,
      },
    },
  };

  beforeEach(() => {
    mockUseLocalParticipantPermissions.mockImplementation(() => {
      const canPublishSources = [TrackSource.SCREEN_SHARE];
      return { canPublishSources };
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the button', () => {
    const { store } = configureStore();
    renderWithProviders(<ShareScreenButton />, { store, provider: { mui: true } });
    expect(screen.getByRole('button', { name: 'Sharescreen' })).toBeInTheDocument();
  });

  it('does not render on devices that not support share screen feature', () => {
    const { store } = configureStore();
    if ('getDisplayMedia' in global.navigator.mediaDevices) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { getDisplayMedia, ...mediaDevicesProps } = global.navigator.mediaDevices;
      Object.assign(global.navigator, {
        mediaDevices: mediaDevicesProps,
      });
    }

    const { container } = renderWithProviders(<ShareScreenButton />, { store, provider: { mui: true } });
    expect(container).toBeEmptyDOMElement();
  });

  describe('disabled state', () => {
    it('is enabled if prerequisites are met', async () => {
      const { store } = configureStore({
        initialState: sharescreenActiveState,
      });

      renderWithProviders(<ShareScreenButton />, { store, provider: { mui: true } });
      const button = screen.getByRole('button', { name: 'Sharescreen' });
      expect(button).not.toBeDisabled();
    });

    it('is enabled, even if can not publish screen, if user is a moderator', async () => {
      const { store } = configureStore({
        initialState: sharescreenActiveState,
      });

      mockUseLocalParticipantPermissions.mockImplementation(() => {
        return {};
      });

      renderWithProviders(<ShareScreenButton />, { store, provider: { mui: true } });
      const button = screen.getByRole('button', { name: 'Sharescreen' });
      expect(button).not.toBeDisabled();
    });

    it('is disabled if user is not a moderator and can not publish screen', async () => {
      const { store } = configureStore({
        initialState: { ...sharescreenActiveState, user: { ...sharescreenActiveState.user, role: Role.User } },
      });

      mockUseLocalParticipantPermissions.mockImplementation(() => {
        return {};
      });

      renderWithProviders(<ShareScreenButton />, { store, provider: { mui: true } });
      const button = screen.getByRole('button', { name: 'Sharescreen' });
      expect(button).toBeDisabled();
    });

    it('is disabled if livekit is not available', async () => {
      const { store } = configureStore({
        initialState: {
          ...sharescreenActiveState,
          livekit: { ...sharescreenActiveState.livekit, unavailable: true },
        },
      });

      renderWithProviders(<ShareScreenButton />, { store, provider: { mui: true } });
      const button = screen.getByRole('button', { name: 'Sharescreen' });
      expect(button).toBeDisabled();
    });

    it('is disabled if screenshare change is in progress', async () => {
      const { store } = configureStore({
        initialState: {
          ...sharescreenActiveState,
          livekit: { ...sharescreenActiveState.livekit, mediaChangeInProgress: ['screenshare'] },
        },
      });

      renderWithProviders(<ShareScreenButton />, { store, provider: { mui: true } });
      const button = screen.getByRole('button', { name: 'Sharescreen' });
      expect(button).toBeDisabled();
    });
  });

  describe('chevron button', () => {
    it('renders if sharescreen is active', async () => {
      const { store } = configureStore({
        initialState: sharescreenActiveState,
      });

      renderWithProviders(<ShareScreenButton />, { store, provider: { mui: true } });
      const chevron = screen.getByRole('button', { name: 'Chevron' });
      expect(chevron).toBeInTheDocument();
    });

    it('does not render if screen share is disabled', async () => {
      const { store } = configureStore({
        initialState: {
          ...sharescreenActiveState,
          livekit: {
            ...sharescreenActiveState.livekit,
            mediaSettings: { ...sharescreenActiveState.livekit.mediaSettings, screenShareEnabled: false },
          },
        },
      });

      renderWithProviders(<ShareScreenButton />, { store, provider: { mui: true } });
      const chevron = screen.queryByRole('button', { name: 'Chevron' });
      expect(chevron).not.toBeInTheDocument();
    });

    it('does not render if livekit is unavailable', async () => {
      const { store } = configureStore({
        initialState: {
          ...sharescreenActiveState,
          livekit: {
            ...sharescreenActiveState.livekit,
            unavailable: true,
          },
        },
      });

      renderWithProviders(<ShareScreenButton />, { store, provider: { mui: true } });
      const chevron = screen.queryByRole('button', { name: 'Chevron' });
      expect(chevron).not.toBeInTheDocument();
    });

    it('does not render if user is not a moderator and can not publish screen', async () => {
      const { store } = configureStore({
        initialState: { ...sharescreenActiveState, user: { ...sharescreenActiveState.user, role: Role.User } },
      });

      mockUseLocalParticipantPermissions.mockImplementation(() => {
        return {};
      });

      renderWithProviders(<ShareScreenButton />, { store, provider: { mui: true } });
      const chevron = screen.queryByRole('button', { name: 'Chevron' });
      expect(chevron).not.toBeInTheDocument();
    });

    it('renders, even if can not publish screen, if user is a moderator', async () => {
      const { store } = configureStore({
        initialState: sharescreenActiveState,
      });

      mockUseLocalParticipantPermissions.mockImplementation(() => {
        return {};
      });

      renderWithProviders(<ShareScreenButton />, { store, provider: { mui: true } });
      const chevron = screen.getByRole('button', { name: 'Chevron' });
      expect(chevron).toBeInTheDocument();
    });
  });

  describe('switch screen context action', () => {
    it('does not render a menu', async () => {
      const { store } = configureStore({
        initialState: sharescreenActiveState,
      });

      renderWithProviders(<ShareScreenButton />, { store, provider: { mui: true } });
      const menu = screen.queryByRole('menu');
      expect(menu).not.toBeInTheDocument();
    });

    it('dispatches switchScreenShare when the user presses the chevron', async () => {
      const { store, dispatchSpy } = configureStore({
        initialState: sharescreenActiveState,
      });

      renderWithProviders(<ShareScreenButton />, { store, provider: { mui: true } });
      const chevron = screen.getByRole('button', { name: 'Chevron' });
      await userEvent.click(chevron);

      expect(dispatchSpy).toHaveBeenCalledWith(vi.mocked(switchScreenShare).mock.results[0].value);
    });
  });
});
