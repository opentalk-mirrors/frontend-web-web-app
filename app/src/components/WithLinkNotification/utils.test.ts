// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { notifications } from '../../commonComponents';
import { DEFAULT_AUTO_HIDE_DURATION } from '../../commonComponents/Notistack/fragments/utils';
import { showWithLinkNotification } from './utils';

vi.mock('../../commonComponents', () => ({
  notifications: {
    toast: vi.fn(),
  },
}));

describe('showWithLinkNotification', () => {
  it('should call notifications.toast with WithLinkNotification component and correct options', () => {
    const props = {
      translationKey: 'test.translation.key',
      url: 'https://example.com',
    };

    showWithLinkNotification(props);

    expect(notifications.toast).toHaveBeenCalledWith(
      expect.any(Object), // The WithLinkNotification component
      {
        variant: 'info',
        ariaLive: 'polite',
        autoHideDuration: DEFAULT_AUTO_HIDE_DURATION,
      }
    );
  });
});
