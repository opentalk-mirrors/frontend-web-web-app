// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen, configureStore } from '../../../utils/testUtils';
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
  test('render ShareScreenButton component', async () => {
    await render(<ShareScreenButton />, store);
    expect(screen.getByTestId('toolbarBlurScreenButton')).toBeInTheDocument();
  });

  test('ShareScreenButton not visible on devices that not support share screen feature', async () => {
    if ('getDisplayMedia' in global.navigator.mediaDevices) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { getDisplayMedia, ...mediaDevicesProps } = global.navigator.mediaDevices;
      Object.assign(global.navigator, {
        mediaDevices: mediaDevicesProps,
      });
    }

    const { container } = await render(<ShareScreenButton />, store);
    expect(container).toBeEmptyDOMElement();
  });
});
