// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import { Mock } from 'vitest';

import useMediaDevice from '../../../hooks/useMediaDevice';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import { mockedAudioInputs } from '../../../utils/testUtils';
import AudioSettingsPanel from './AudioSettingsPanel';

vi.mock('./DeviceManager', () => ({
  ...vi.importActual('./DeviceManager'),
  __esModule: true,
  default: () => <div data-testid="MockDeviceManager"></div>,
}));

vi.mock('../../../hooks/useMediaDevice', () => ({
  default: vi.fn(),
}));

const mockUseMediaDevice = useMediaDevice as Mock;

describe('AudioSettingsPanel', () => {
  beforeEach(() => {
    mockUseMediaDevice.mockImplementation(() => ({
      loadLocalDevices: vi.fn(() => Promise.resolve(undefined)),
      localDevices: mockedAudioInputs,
      permissionDenied: false,
    }));
  });
  it('renders title and device manager', async () => {
    const { store } = configureStore();
    renderWithProviders(<AudioSettingsPanel />, { store });
    expect(screen.getByRole('heading', { name: 'audio-settings-title' })).toBeInTheDocument();
    expect(screen.getByTestId('MockDeviceManager')).toBeInTheDocument();
  });
});
