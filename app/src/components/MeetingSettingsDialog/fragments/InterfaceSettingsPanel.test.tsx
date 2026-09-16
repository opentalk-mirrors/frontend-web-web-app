// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ConferenceUiVersion } from '../../../config/uiVersion';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import InterfaceSettingsPanel from './InterfaceSettingsPanel';

const renderPanel = (preferred: ConferenceUiVersion) => {
  const { store } = configureStore({
    initialState: {
      config: { features: { conferenceUiV2: true } },
      uiVersion: { preferredVersion: preferred },
    },
  });
  renderWithProviders(<InterfaceSettingsPanel />, { store, provider: { mui: true } });
  return store;
};

describe('InterfaceSettingsPanel', () => {
  it('reflects the current preferred version', () => {
    renderPanel(ConferenceUiVersion.V2);
    expect(screen.getByText('interface-settings-new-ui-label')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('opts the user into v2 when toggled on', async () => {
    const view = renderPanel(ConferenceUiVersion.V1);
    const toggle = screen.getByRole('switch');
    expect(toggle).not.toBeChecked();

    await userEvent.click(toggle);

    expect(view.getState().uiVersion.preferredVersion).toBe(ConferenceUiVersion.V2);
  });

  it('opts the user back out to v1 when toggled off', async () => {
    const view = renderPanel(ConferenceUiVersion.V2);
    const toggle = screen.getByRole('switch');

    await userEvent.click(toggle);

    expect(view.getState().uiVersion.preferredVersion).toBe(ConferenceUiVersion.V1);
  });
});
