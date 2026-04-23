// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen } from '@testing-library/react';

import { mockedAudioInputs } from '../../../utils/testUtils';
import DeviceManager from './DeviceManager';
import { DevicePermissionState } from './constants';

vi.mock('./DeviceList', () => ({
  default: () => <div data-testid="MockDeviceList"></div>,
}));

vi.mock('react-i18next', () => ({
  // this mock makes sure any components using the translate hook can use it without a warning being shown
  useTranslation: () => {
    return {
      t: (str: string) => str,
    };
  },
  initReactI18next: {
    type: '3rdParty',
  },
}));

const SUBHEADER_TITLE = 'Choose audio input';

describe('DeviceManager', () => {
  it('renders device list if device permission are confirmed', () => {
    const DEVICE_NUMBER = 2;
    render(
      <DeviceManager
        devices={mockedAudioInputs.slice(0, DEVICE_NUMBER)}
        selectedDevice={undefined}
        onSelectDevice={vi.fn()}
        subheader={{ title: SUBHEADER_TITLE }}
        state={DevicePermissionState.Confirmed}
      />
    );
    expect(screen.getByTestId('MockDeviceList')).toBeInTheDocument();
  });
  it('shows system notification if device permission are requested', () => {
    render(
      <DeviceManager
        devices={undefined}
        selectedDevice={undefined}
        onSelectDevice={vi.fn()}
        subheader={{ title: SUBHEADER_TITLE }}
        state={DevicePermissionState.Pending}
      />
    );
    expect(screen.getByText('device-permission-pending')).toBeInTheDocument();
    expect(screen.getByTestId('warning-icon')).toBeInTheDocument();
  });
  it('system notification if device permission are denied', () => {
    render(
      <DeviceManager
        devices={undefined}
        selectedDevice={undefined}
        onSelectDevice={vi.fn()}
        subheader={{ title: SUBHEADER_TITLE }}
        state={DevicePermissionState.Denied}
      />
    );
    expect(screen.getByText('device-permission-denied')).toBeInTheDocument();
    expect(screen.getByTestId('error-icon')).toBeInTheDocument();
  });
});
