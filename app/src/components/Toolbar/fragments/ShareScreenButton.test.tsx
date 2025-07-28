// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { renderWithProviders, configureStore } from '../../../utils/testUtils';
import ShareScreenButton from './ShareScreenButton';

vi.mock('@livekit/components-react', () => ({
  useTrackToggle: () => ({
    toggle: vi.fn(),
    enabled: true,
    pending: false,
  }),
  useLocalParticipantPermissions: vi.fn(),
}));

describe('<ShareScreenButton />', () => {
  const { store } = configureStore();
  it('render ShareScreenButton component', () => {
    renderWithProviders(<ShareScreenButton />, { store, provider: { mui: true } });
    expect(screen.getByTestId('toolbarShareScreenButton')).toBeInTheDocument();
  });

  it('ShareScreenButton not visible on devices that not support share screen feature', () => {
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

  it('Button is disabled if isLivekitUnavailable is true', async () => {
    const { store } = configureStore({
      initialState: {
        livekit: {
          unavailable: true,
          videoBackgroundEffects: { style: 'off', loading: false },
          mediaSettings: {
            cameraEnabled: false,
            microphoneEnabled: false,
            screenShareEnabled: false,
          },
        },
      },
    });

    renderWithProviders(<ShareScreenButton />, { store, provider: { mui: true } });
    expect(screen.getByTestId('toolbarShareScreenButton')).toBeDisabled();
  });
});
