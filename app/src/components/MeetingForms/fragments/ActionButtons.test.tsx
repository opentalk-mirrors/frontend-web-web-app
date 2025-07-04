// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { renderWithProviders } from '../../../utils/testUtils';
import ActionButtons from './ActionButtons';

describe('ActionButtons', () => {
  it('renders all elements for new event', () => {
    renderWithProviders(<ActionButtons isExistingEvent={false} disableSaveButton={false} />, {
      provider: { router: true },
    });

    expect(screen.queryByRole('button', { name: 'dashboard-meeting-to-step' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'global-cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'global-save' })).toBeInTheDocument();
  });
  it('renders all elements for exisiting event', () => {
    renderWithProviders(<ActionButtons isExistingEvent={true} disableSaveButton={false} />, {
      provider: { router: true },
    });

    expect(screen.getByRole('button', { name: 'dashboard-meeting-to-step' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'global-cancel' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'global-save-changes' })).toBeInTheDocument();
  });
});
