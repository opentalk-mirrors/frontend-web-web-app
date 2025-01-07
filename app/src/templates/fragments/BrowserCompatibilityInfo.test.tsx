// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { notificationAction } from '../../commonComponents';
import browser from '../../modules/BrowserSupport';
import { render } from '../../utils/testUtils';
import { screen } from '../../utils/testUtils';
import BrowserCompatibilityInfo from './BrowserCompatibilityInfo';

jest.mock('../../modules/BrowserSupport');
jest.mock('../../commonComponents');
jest.mock('../../components/ConfirmBrowserDialog/ConfirmBrowserDialog', () => ({
  __esModule: true,
  default: () => {
    return <div role="document" />;
  },
}));

describe('BrowserCompatibilityInfo', () => {
  test('render children', async () => {
    (browser.isBrowserConfirmed as jest.Mock).mockReturnValue(true);

    const TestChild = () => <div role="contentinfo" />;
    await render(
      <BrowserCompatibilityInfo>
        <TestChild />
      </BrowserCompatibilityInfo>
    );

    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
  test('render ConfirmBrowserDialog', async () => {
    (browser.isBrowserConfirmed as jest.Mock).mockReturnValue(false);

    const TestChild = () => <div role="contentinfo" />;
    await render(
      <BrowserCompatibilityInfo>
        <TestChild />
      </BrowserCompatibilityInfo>
    );

    expect(screen.getByRole('document')).toBeInTheDocument();
  });
  test('notification will be shown for safari', async () => {
    (browser.isSafari as jest.Mock).mockReturnValue(true);
    await render(<BrowserCompatibilityInfo />);

    expect(notificationAction).toHaveBeenCalledTimes(1);
  });
  test('notification will be not shown for non-safari', async () => {
    (browser.isSafari as jest.Mock).mockReturnValue(false);
    await render(<BrowserCompatibilityInfo />);

    expect(notificationAction).not.toHaveBeenCalled();
  });
});
