// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, fireEvent } from '@testing-library/react';

import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import ParticipantGroupingForm from './ParticipantGroupingForm';

describe('ParticipantGroupingForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with switch checked and correct label when grouping is enabled', () => {
    const { store } = configureStore({
      initialState: {
        ui: {
          showParticipantGroups: true,
        },
      },
    });
    renderWithProviders(<ParticipantGroupingForm />, { store });

    expect(screen.getByLabelText('sort-groups-on')).toBeInTheDocument();

    const switchInput = screen.getByRole('checkbox');

    expect(switchInput).toBeChecked();
  });

  it('renders with switch unchecked and correct label when grouping is disabled', () => {
    const { store } = configureStore({
      initialState: {
        ui: {
          showParticipantGroups: false,
        },
      },
    });
    renderWithProviders(<ParticipantGroupingForm />, { store });

    expect(screen.getByLabelText('sort-groups-off')).toBeInTheDocument();

    const switchInput = screen.getByRole('checkbox');

    expect(switchInput).not.toBeChecked();
  });

  it('dispatches setSortByGroups with correct value when toggled', () => {
    const { store } = configureStore({
      initialState: {
        ui: {
          showParticipantGroups: false,
        },
      },
    });
    renderWithProviders(<ParticipantGroupingForm />, { store });

    const switchInput = screen.getByRole('checkbox');
    fireEvent.click(switchInput);

    expect(store.getState().ui.showParticipantGroups).toEqual(true);
  });
});
