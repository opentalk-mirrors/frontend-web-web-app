// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DeviceId } from '../../../types/device';
import { mockedAudioInputs } from '../../../utils/testUtils';
import DeviceList from './DeviceList';

const SUBHEADER_TITLE = 'Choose audio input';

describe('DeviceList', () => {
  it('renders device list with subheader if device permission are confirmed', () => {
    const DEVICE_NUMBER = 2;
    render(
      <DeviceList
        devices={mockedAudioInputs.slice(0, DEVICE_NUMBER)}
        selectedDevice={undefined}
        onSelectDevice={jest.fn()}
        subheader={{ title: SUBHEADER_TITLE }}
      />
    );
    const deviceMenu = screen.getByRole('menu', { name: SUBHEADER_TITLE });
    expect(deviceMenu).toBeInTheDocument();
    const devices = screen.getAllByRole('menuitemradio');
    expect(devices.length).toEqual(DEVICE_NUMBER);
  });
  it('renders done icon for selected device and sets aria-checked status', () => {
    render(
      <DeviceList
        devices={mockedAudioInputs.slice(0, 2)}
        selectedDevice={mockedAudioInputs[0].deviceId as DeviceId}
        onSelectDevice={jest.fn()}
        subheader={{ title: SUBHEADER_TITLE }}
      />
    );
    const selectedDevice = screen.getByRole('menuitemradio', { name: mockedAudioInputs[0].label });
    expect(within(selectedDevice).getByTestId('done-icon')).toBeInTheDocument();
    expect(selectedDevice).toHaveAttribute('aria-checked', 'true');
    const notSelectedDevice = screen.getByRole('menuitemradio', { name: mockedAudioInputs[1].label });
    expect(within(notSelectedDevice).queryByTestId('done-icon')).not.toBeInTheDocument();
    expect(notSelectedDevice).toHaveAttribute('aria-checked', 'false');
  });
  it('returns device id on device selection', async () => {
    const CLICKED_DEVICE_INDEX = 0;
    const mockedOnSelectDevice = jest.fn();
    render(
      <DeviceList
        devices={mockedAudioInputs.slice(0, 2)}
        selectedDevice={undefined}
        onSelectDevice={mockedOnSelectDevice}
        subheader={{ title: SUBHEADER_TITLE }}
      />
    );
    const selectedDevice = screen.getByRole('menuitemradio', { name: mockedAudioInputs[CLICKED_DEVICE_INDEX].label });
    await userEvent.click(selectedDevice);
    expect(mockedOnSelectDevice).toBeCalledWith(mockedAudioInputs[CLICKED_DEVICE_INDEX].deviceId);
  });
});
