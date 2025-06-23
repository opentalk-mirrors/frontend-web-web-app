// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../../utils/testUtils';
import MobileDialogContent from './MobileDialogContent';
import { SettingsPanel } from './settingPanels';

const CUSTOM_PANEL_CONTENT_ID = 'custom-content';
const AUDIO_PANEL_CONTENT_ID = 'audio-content';

const SETTING_PANELS: Array<SettingsPanel> = [
  {
    value: 'audio',
    component: <span data-testid={AUDIO_PANEL_CONTENT_ID}>Audio tab panel</span>,
  },
  {
    value: 'video',
    component: <span data-testid={CUSTOM_PANEL_CONTENT_ID}>Some text</span>,
  },
];

// // to be able to use variables in mocked modules
// // we need to create a `mock_` variable outside of the mocked implementation
// // and than set this variable to desired value before the test runs
// // either in the test itself or via beforeAll, beforeEach...
let mockPanels: Array<SettingsPanel>;
jest.mock('./settingPanels', () => {
  return {
    getSettingPanels: () => mockPanels,
  };
});

describe('MobileDialogContent', () => {
  beforeAll(() => {
    mockPanels = SETTING_PANELS;
  });
  it('renders the header', async () => {
    renderWithProviders(<MobileDialogContent onClose={jest.fn()} setting="audio" />, { provider: { mui: true } });
    const title = screen.getByRole('heading', { name: 'meeting-settings-title' });
    expect(title).toBeInTheDocument();
  });
  it('calls onClose if user clicks close button', async () => {
    const onClose = jest.fn();
    renderWithProviders(<MobileDialogContent onClose={onClose} setting="audio" />, { provider: { mui: true } });
    const closeButton = screen.getByRole('button', { name: 'global-close-dialog' });
    expect(closeButton).toBeInTheDocument();
    await userEvent.click(closeButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });
  it('renders the combobox with specified setting title and respective setting panel below', async () => {
    const setting = 'audio';
    const testId = AUDIO_PANEL_CONTENT_ID;
    renderWithProviders(<MobileDialogContent onClose={jest.fn()} setting={setting} />, { provider: { mui: true } });

    const select = screen.getByRole('combobox', { name: 'meeting-settings-title' });
    expect(select).toHaveTextContent(setting);

    const panel = screen.getByTestId(testId);
    expect(panel).toBeInTheDocument();
  });
  it('renders all panel titles in the combobox dropdown', async () => {
    renderWithProviders(<MobileDialogContent onClose={jest.fn()} setting="audio" />, { provider: { mui: true } });

    const select = screen.getByRole('combobox', { name: 'meeting-settings-title' });
    fireEvent.mouseDown(select);

    const options = screen.getAllByRole('option');
    expect(options.length).toEqual(SETTING_PANELS.length);
    expect(options[0]).toHaveTextContent(`${SETTING_PANELS[0].value}-panel-title`);
    expect(options[1]).toHaveTextContent(`${SETTING_PANELS[1].value}-panel-title`);
  });
});
