// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConnectionState, Room } from 'livekit-client';
import { Mock } from 'vitest';

import useMediaDevice from '../../../hooks/useMediaDevice';
import { initialState as initialConfigState } from '../../../store/slices/configSlice';
import { initialState as initialLivekitState } from '../../../store/slices/livekitSlice';
import { VideoSetting } from '../../../types';
import type { DeviceId } from '../../../types/device';
import { configureStore, mockedVideoInputs, renderWithProviders } from '../../../utils/testUtils';
import CameraSettingsPanel from './CameraSettingsPanel';
import type { DeviceListProps } from './DeviceList';
import { DevicePermissionState } from './constants';

const { deviceManagerMock, mockIsBackgroundEffectSupported } = vi.hoisted(() => ({
  deviceManagerMock: vi.fn(),
  mockIsBackgroundEffectSupported: vi.fn(),
}));

vi.mock('./DeviceManager', () => ({
  __esModule: true,
  default: (props: DeviceListProps & { state: DevicePermissionState }) => {
    deviceManagerMock(props);
    const firstDeviceId = props.devices?.[0]?.deviceId;
    return (
      <div data-testid="MockDeviceManager">
        <button
          data-testid="trigger-select"
          onClick={() => firstDeviceId && props.onSelectDevice?.(firstDeviceId as DeviceId)}
        >
          select
        </button>
      </div>
    );
  },
}));

vi.mock('../../../utils/mediaUtils', () => ({
  isBackgroundEffectSupported: mockIsBackgroundEffectSupported,
}));

vi.mock('../../../hooks/useMediaDevice', () => ({
  default: vi.fn(),
}));

const mockUseMediaDevice = useMediaDevice as Mock;

describe('CameraSettingsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsBackgroundEffectSupported.mockReturnValue(false);
    mockUseMediaDevice.mockReturnValue({
      loadLocalDevices: vi.fn(),
      localDevices: mockedVideoInputs,
      permissionDenied: false,
    });
  });

  it('renders title, loads devices on mount and passes confirmed state to DeviceManager', () => {
    const loadLocalDevices = vi.fn();
    mockUseMediaDevice.mockReturnValue({
      loadLocalDevices,
      localDevices: mockedVideoInputs,
      permissionDenied: false,
    });

    const { store } = configureStore();
    renderWithProviders(<CameraSettingsPanel />, { store, provider: { mui: true } });

    expect(screen.getByRole('heading', { name: 'camera-settings-title' })).toBeInTheDocument();
    expect(loadLocalDevices).toHaveBeenCalledTimes(1);
    expect(deviceManagerMock).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        devices: mockedVideoInputs,
        state: DevicePermissionState.Confirmed,
      })
    );
  });

  it('filters duplicate devices before passing them to the device manager', () => {
    const duplicatedDevices: Array<MediaDeviceInfo> = [
      { deviceId: 'duplicate-id', groupId: 'group', kind: 'videoinput', label: 'Alpha Cam', toJSON: vi.fn() },
      { deviceId: 'duplicate-id', groupId: 'group', kind: 'videoinput', label: 'Zulu Cam', toJSON: vi.fn() },
      { deviceId: 'unique-id', groupId: 'group', kind: 'videoinput', label: 'Beta Cam', toJSON: vi.fn() },
    ];

    mockUseMediaDevice.mockReturnValue({
      loadLocalDevices: vi.fn(),
      localDevices: duplicatedDevices,
      permissionDenied: 'pending',
    });

    const { store } = configureStore();
    renderWithProviders(<CameraSettingsPanel />, { store, provider: { mui: true } });

    const lastCall = deviceManagerMock.mock.lastCall;
    expect(lastCall).toBeDefined();
    const [deviceProps] = lastCall as [DeviceListProps & { state: DevicePermissionState }];
    const { devices, state } = deviceProps;
    expect(state).toBe(DevicePermissionState.Confirmed);
    expect(devices).toHaveLength(2);
    expect(devices?.map((device: MediaDeviceInfo) => device?.deviceId)).toEqual(['duplicate-id', 'unique-id']);
    expect(devices?.map((device: MediaDeviceInfo) => device?.label)).toEqual(['Alpha Cam', 'Beta Cam']);
  });

  it('reports pending and denied device permissions', () => {
    mockUseMediaDevice.mockReturnValue({
      loadLocalDevices: vi.fn(),
      localDevices: [],
      permissionDenied: 'pending',
    });

    const { unmount } = renderWithProviders(<CameraSettingsPanel />, {
      store: configureStore().store,
      provider: { mui: true },
    });

    expect(deviceManagerMock).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ state: DevicePermissionState.Pending, devices: [] })
    );

    unmount();
    deviceManagerMock.mockClear();

    mockUseMediaDevice.mockReturnValue({
      loadLocalDevices: vi.fn(),
      localDevices: [],
      permissionDenied: true,
    });

    renderWithProviders(<CameraSettingsPanel />, { store: configureStore().store, provider: { mui: true } });
    expect(deviceManagerMock).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ state: DevicePermissionState.Denied })
    );
  });

  it('updates local device selection when no room is connected', async () => {
    const user = userEvent.setup();
    const { store } = configureStore();

    renderWithProviders(<CameraSettingsPanel />, { store, provider: { mui: true } });
    await user.click(screen.getByTestId('trigger-select'));

    await waitFor(() =>
      expect(store.getState().livekit.mediaSettings.videoDeviceId).toBe(mockedVideoInputs[0].deviceId)
    );
  });

  it('updates active device selection when room is connected', async () => {
    const user = userEvent.setup();
    const switchActiveDeviceMock = vi.fn().mockResolvedValue(undefined);
    const room = {
      state: ConnectionState.Connected,
      switchActiveDevice: switchActiveDeviceMock,
      localParticipant: {
        getTrackPublication: vi.fn(() => ({ videoTrack: { setProcessor: vi.fn() } })),
      },
    } as unknown as Room;

    const { store } = configureStore({
      initialState: {
        livekit: { ...initialLivekitState, room },
      },
    });

    renderWithProviders(<CameraSettingsPanel />, { store, provider: { mui: true } });
    await user.click(screen.getByTestId('trigger-select'));

    await waitFor(() =>
      expect(store.getState().livekit.mediaSettings.videoDeviceId).toBe(mockedVideoInputs[0].deviceId)
    );

    expect(switchActiveDeviceMock).toHaveBeenCalledExactlyOnceWith(
      'videoinput',
      mockedVideoInputs[0].deviceId,
      undefined
    );
  });

  it('toggles participant videos and mirroring switches', async () => {
    const user = userEvent.setup();
    const { store } = configureStore();

    renderWithProviders(<CameraSettingsPanel />, { store, provider: { mui: true } });

    await user.click(screen.getByRole('switch', { name: 'videomenu-participant-videos' }));
    await waitFor(() => expect(store.getState().livekit.qualityCap).toBe(VideoSetting.Off));

    await user.click(screen.getByRole('switch', { name: 'videomenu-mirroring' }));
    expect(store.getState().ui.localVideoMirroringEnabled).toBe(false);
  });

  it('enables and disables blur background effect', async () => {
    mockIsBackgroundEffectSupported.mockReturnValue(true);
    const user = userEvent.setup();
    const { store } = configureStore();

    renderWithProviders(<CameraSettingsPanel />, { store, provider: { mui: true } });
    const blurSwitch = screen.getByRole('switch', { name: 'videomenu-blur' });

    await user.click(blurSwitch);

    await waitFor(() => expect(store.getState().livekit.videoBackgroundEffects.style).toBe('blur'));

    await user.click(blurSwitch);
    await waitFor(() => expect(store.getState().livekit.videoBackgroundEffects.style).toBe('off'));
  });

  it('selects and clears background images', async () => {
    mockIsBackgroundEffectSupported.mockReturnValue(true);
    const user = userEvent.setup();
    const videoBackgrounds = [
      { altText: 'Sky', url: '/backgrounds/sky', thumb: '/thumbs/sky' },
      { altText: 'Forest', url: '/backgrounds/forest', thumb: '/thumbs/forest' },
    ];

    const { store } = configureStore({
      initialState: {
        livekit: { ...initialLivekitState },
        config: { ...initialConfigState, videoBackgrounds },
      },
    });

    renderWithProviders(<CameraSettingsPanel />, { store, provider: { mui: true } });

    const skyBackground = screen.getByRole('img', { name: 'Sky' });
    await user.click(skyBackground);

    await waitFor(() =>
      expect(store.getState().livekit.videoBackgroundEffects).toEqual(
        expect.objectContaining({ style: 'image', imageUrl: '/backgrounds/sky' })
      )
    );

    await waitFor(() => expect(store.getState().livekit.videoBackgroundEffects.loading).toBe(false));

    await user.click(skyBackground);

    await waitFor(() => expect(store.getState().livekit.videoBackgroundEffects.style).toBe('off'));
  });
});
