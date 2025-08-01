// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import { Mock } from 'vitest';

import useMediaDevice from '../../../hooks/useMediaDevice';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import { mockedVideoInputs } from '../../../utils/testUtils';
import CameraSettingsPanel from './CameraSettingsPanel';

vi.mock('./DeviceManager', () => ({
  ...vi.importActual('./DeviceManager'),
  __esModule: true,
  default: () => <div data-testid="MockDeviceManager"></div>,
}));

vi.mock('../../../hooks/useMediaDevice', () => ({
  default: vi.fn(),
}));

const mockUseMediaDevice = useMediaDevice as Mock;

describe('CameraSettingsPanel', () => {
  beforeEach(() => {
    mockUseMediaDevice.mockImplementation(() => ({
      loadLocalDevices: vi.fn(() => Promise.resolve(undefined)),
      localDevices: mockedVideoInputs,
      permissionDenied: false,
    }));
  });

  it('renders title and device manager', async () => {
    const { store } = configureStore();
    renderWithProviders(<CameraSettingsPanel />, { store });
    expect(screen.getByRole('heading', { name: 'camera-settings-title' })).toBeInTheDocument();
    expect(screen.getByTestId('MockDeviceManager')).toBeInTheDocument();
  });
});
