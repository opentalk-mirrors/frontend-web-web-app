// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import useMediaDevice from '../../../hooks/useMediaDevice';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import { mockedVideoInputs } from '../../../utils/testUtils';
import { VideoSettingsPanel } from './VideoSettingsPanel';

jest.mock('./DeviceManager', () => ({
  ...jest.requireActual('./DeviceManager'),
  __esModule: true,
  default: () => <div data-testid="MockDeviceManager"></div>,
}));

jest.mock('../../../hooks/useMediaDevice', () => jest.fn());

const mockUseMediaDevice = useMediaDevice as jest.Mock;

describe('AudioSettingsPanel', () => {
  beforeEach(() => {
    mockUseMediaDevice.mockImplementation(() => ({
      loadLocalDevices: jest.fn(() => Promise.resolve(undefined)),
      localDevices: mockedVideoInputs,
      permissionDenied: false,
    }));
  });
  // This test should be enhanced and fixed in https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2678
  it.skip('renders title and device manager', async () => {
    const { store } = configureStore();
    renderWithProviders(<VideoSettingsPanel />, { store });
    expect(screen.getByRole('heading', { name: 'video-settings-title' })).toBeInTheDocument();
    expect(screen.getByTestId('MockDeviceManager')).toBeInTheDocument();
  });
});
