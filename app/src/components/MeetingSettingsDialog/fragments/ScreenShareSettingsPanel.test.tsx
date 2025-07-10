// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import ScreenShareSettingsPanel from './ScreenShareSettingsPanel';

describe('ScreenShareSettingsPanel', () => {
  it('renders title', async () => {
    const { store } = configureStore();
    renderWithProviders(<ScreenShareSettingsPanel />, { store });
    expect(screen.getByRole('heading', { name: 'screen-share-panel-title' })).toBeInTheDocument();
  });
});
