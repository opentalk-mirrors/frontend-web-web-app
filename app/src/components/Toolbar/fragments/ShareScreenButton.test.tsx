// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { renderWithProviders, configureStore } from '../../../utils/testUtils';
import ShareScreenButton from './ShareScreenButton';

jest.mock('@livekit/components-react', () => ({
  useTrackToggle: () => ({
    toggle: jest.fn(),
    enabled: true,
    pending: false,
  }),
  useLocalParticipantPermissions: jest.fn(),
}));

describe('<ShareScreenButton />', () => {
  const { store } = configureStore();
  test('render ShareScreenButton component', () => {
    renderWithProviders(<ShareScreenButton />, { store });
    expect(screen.getByTestId('toolbarShareScreenButton')).toBeInTheDocument();
  });

  test('ShareScreenButton not visible on devices that not support share screen feature', () => {
    if ('getDisplayMedia' in global.navigator.mediaDevices) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { getDisplayMedia, ...mediaDevicesProps } = global.navigator.mediaDevices;
      Object.assign(global.navigator, {
        mediaDevices: mediaDevicesProps,
      });
    }

    const { container } = renderWithProviders(<ShareScreenButton />, { store });
    expect(container).toBeEmptyDOMElement();
  });

  test('Button is disabled if isLivekitUnavailable is true', async () => {
    const { store } = configureStore({
      initialState: {
        livekit: {
          unavailable: true,
        },
      },
    });

    renderWithProviders(<ShareScreenButton />, { store });
    expect(screen.getByTestId('toolbarShareScreenButton')).toBeDisabled();
  });
});
