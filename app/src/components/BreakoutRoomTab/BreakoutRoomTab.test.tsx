// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { configureStore, renderWithProviders } from '../../utils/testUtils';
import BreakoutRoomTab from './BreakoutRoomTab';

vi.mock('./fragments/RoomOverview', () => ({
  __esModule: true,
  default: () => <div>Room Overview</div>,
}));

vi.mock('./fragments/CreateRoomsForm', () => ({
  __esModule: true,
  default: () => <div>Create Rooms Form</div>,
}));

describe('BreakoutRoomTab', () => {
  it('renders CreateRoomsForm when breakout room is inactive', () => {
    const { store } = configureStore({
      initialState: {
        breakout: {
          active: false,
        },
      },
    });
    renderWithProviders(<BreakoutRoomTab />, { store });
    expect(screen.getByText('Create Rooms Form')).toBeInTheDocument();
  });

  it('renders RoomOverview when breakout room is active', () => {
    const { store } = configureStore({
      initialState: {
        breakout: {
          active: true,
        },
      },
    });
    renderWithProviders(<BreakoutRoomTab />, { store });
    expect(screen.getByText('Room Overview')).toBeInTheDocument();
  });
});
