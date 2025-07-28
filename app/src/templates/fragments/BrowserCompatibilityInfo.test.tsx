// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { notificationAction } from '../../commonComponents';
import browser from '../../modules/BrowserSupport';
import { configureStore, renderWithProviders } from '../../utils/testUtils';
import BrowserCompatibilityInfo from './BrowserCompatibilityInfo';

jest.mock('../../modules/BrowserSupport');
jest.mock('../../commonComponents');
jest.mock('../../components/ConfirmBrowserDialog/ConfirmBrowserDialog', () => ({
  __esModule: true,
  default: () => {
    return <div role="document" />;
  },
}));

const createStore = (suppress = false) =>
  configureStore({
    initialState: {
      config: { settings: { suppressBrowserCompatibilityInfo: suppress } },
    },
  }).store;

describe('BrowserCompatibilityInfo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children', () => {
    (browser.isBrowserConfirmed as jest.Mock).mockReturnValue(true);
    const TestChild = () => <div role="contentinfo" />;
    renderWithProviders(
      <BrowserCompatibilityInfo>
        <TestChild />
      </BrowserCompatibilityInfo>,
      { store: createStore() }
    );
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('renders ConfirmBrowserDialog', () => {
    (browser.isBrowserConfirmed as jest.Mock).mockReturnValue(false);
    const TestChild = () => <div role="contentinfo" />;
    renderWithProviders(
      <BrowserCompatibilityInfo>
        <TestChild />
      </BrowserCompatibilityInfo>,
      { store: createStore() }
    );
    expect(screen.getByRole('document')).toBeInTheDocument();
  });

  describe('Safari notification', () => {
    it('shows notification for safari', () => {
      (browser.isSafari as jest.Mock).mockReturnValue(true);
      renderWithProviders(<BrowserCompatibilityInfo />, { store: createStore() });
      expect(notificationAction).toHaveBeenCalledTimes(1);
    });

    it('does not show notification for non-safari', () => {
      (browser.isSafari as jest.Mock).mockReturnValue(false);
      renderWithProviders(<BrowserCompatibilityInfo />, { store: createStore() });
      expect(notificationAction).not.toHaveBeenCalled();
    });

    it('does not show notification for safari if suppressBrowserCompatibilityInfo is true', () => {
      (browser.isSafari as jest.Mock).mockReturnValue(true);
      renderWithProviders(<BrowserCompatibilityInfo />, { store: createStore(true) });
      expect(notificationAction).not.toHaveBeenCalled();
    });
  });
});
