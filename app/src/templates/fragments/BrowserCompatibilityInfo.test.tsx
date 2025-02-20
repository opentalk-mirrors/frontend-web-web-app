// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen } from '@testing-library/react';

import { notificationAction } from '../../commonComponents';
import browser from '../../modules/BrowserSupport';
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
  test('render children', () => {
    (browser.isBrowserConfirmed as jest.Mock).mockReturnValue(true);

    const TestChild = () => <div role="contentinfo" />;
    render(
      <BrowserCompatibilityInfo>
        <TestChild />
      </BrowserCompatibilityInfo>
    );

    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
  test('render ConfirmBrowserDialog', () => {
    (browser.isBrowserConfirmed as jest.Mock).mockReturnValue(false);

    const TestChild = () => <div role="contentinfo" />;
    render(
      <BrowserCompatibilityInfo>
        <TestChild />
      </BrowserCompatibilityInfo>
    );

    expect(screen.getByRole('document')).toBeInTheDocument();
  });
  test('notification will be shown for safari', () => {
    (browser.isSafari as jest.Mock).mockReturnValue(true);
    render(<BrowserCompatibilityInfo />);

    expect(notificationAction).toHaveBeenCalledTimes(1);
  });
  test('notification will be not shown for non-safari', () => {
    (browser.isSafari as jest.Mock).mockReturnValue(false);
    render(<BrowserCompatibilityInfo />);

    expect(notificationAction).not.toHaveBeenCalled();
  });
});
