// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../../utils/testUtils';
import DesktopDialogContent from './DesktopDialogContent';
import { SettingsPanel } from './settingPanels';

const CUSTOM_PANEL_CONTENT_ID = 'custom-content';

const SETTING_PANELS: Array<SettingsPanel> = [
  {
    value: 'audio',
    component: <span>Audio tab panel</span>,
  },
  {
    value: 'video',
    component: <span data-testid={CUSTOM_PANEL_CONTENT_ID}>Some text</span>,
  },
];

// to be able to use variables in mocked modules
// we need to create a `mock_` variable outside of the mocked implementation
// and than set this variable to desired value before the test runs
// either in the test itself or via beforeAll, beforeEach...
let mockPanels: Array<SettingsPanel>;
jest.mock('./settingPanels', () => {
  return {
    getSettingPanels: () => mockPanels,
  };
});

describe('DesktopDialogContent', () => {
  beforeAll(() => {
    mockPanels = SETTING_PANELS;
  });
  it('renders the header, footer with dev-version and separator', () => {
    const version = window.config.version;
    window.config.version = undefined;

    renderWithProviders(<DesktopDialogContent onClose={jest.fn()} setting="audio" />, { provider: { mui: true } });
    const title = screen.getByRole('heading', { name: 'meeting-settings-title' });
    expect(title).toBeInTheDocument();
    const footer = screen.getByText('OpenTalk dev-version');
    expect(footer).toBeInTheDocument();
    const divider = screen.getByRole('separator');
    expect(divider).toBeInTheDocument();

    window.config.version = version;
  });
  it('calls onClose if user clicks close button', async () => {
    const onClose = jest.fn();
    renderWithProviders(<DesktopDialogContent onClose={onClose} setting="audio" />, { provider: { mui: true } });
    const closeButton = screen.getByRole('button', { name: 'global-close-dialog' });
    expect(closeButton).toBeInTheDocument();
    userEvent.click(closeButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });
  it('renders specified product version in the footer', () => {
    const version = window.config.version;
    const product = 'v24.0.1';
    window.config.version = { product, frontend: 'v0.0.0' };

    renderWithProviders(<DesktopDialogContent onClose={jest.fn()} setting="audio" />, { provider: { mui: true } });
    const footer = screen.getByText(`OpenTalk ${product}`);
    expect(footer).toBeInTheDocument();

    window.config.version = version;
  });
  it('renders all panels as tablist and tabs', () => {
    renderWithProviders(<DesktopDialogContent onClose={jest.fn()} setting="audio" />, { provider: { mui: true } });
    const tabList = screen.getByRole('tablist', { name: 'meeting-settings-title' });
    expect(tabList).toBeInTheDocument();
    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toEqual(2);
  });
  it('opens audio tab by default', () => {
    const audioTabTitle = 'audio-panel-title';
    renderWithProviders(<DesktopDialogContent onClose={jest.fn()} setting="audio" />, { provider: { mui: true } });
    const audioTab = screen.getByRole('tab', { name: audioTabTitle });
    expect(audioTab).toHaveAttribute('aria-selected', 'true');
    const audioTabPanel = screen.getByRole('tabpanel', { name: audioTabTitle });
    expect(audioTabPanel).toBeInTheDocument();
  });
  it('opens custom tab on opening, if specified', () => {
    const tabValue = SETTING_PANELS[1].value;
    const tabTitle = `${tabValue}-panel-title`;
    renderWithProviders(<DesktopDialogContent onClose={jest.fn()} setting={tabValue} />, { provider: { mui: true } });
    const customTab = screen.getByRole('tab', { name: tabTitle });
    expect(customTab).toHaveAttribute('aria-selected', 'true');
    const customTabPanel = screen.getByRole('tabpanel', { name: tabTitle });
    expect(customTabPanel).toBeInTheDocument();
    const customTabContent = screen.getByTestId(CUSTOM_PANEL_CONTENT_ID);
    expect(customTabContent).toBeInTheDocument();
  });
});
