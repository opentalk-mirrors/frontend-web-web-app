// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import WaitingParticipantsPopover from './WaitingParticipantsPopover';

vi.mock('../../WaitingParticipantsList', () => ({
  __esModule: true,
  default: () => <div>WaitingParticipantsList</div>,
}));

describe('WaitingParticipantsPopover rendering logic', () => {
  it('should not render if there are no participants in waiting room', () => {
    const { store } = configureStore({
      initialState: {
        participants: {
          ids: [],
          entities: {},
        },
      },
    });
    renderWithProviders(<WaitingParticipantsPopover />, { store, provider: { mui: true } });
    expect(screen.queryByTestId('waiting-list-button')).not.toBeInTheDocument();
  });

  it('should render if there are participants in waiting room', () => {
    const { store } = configureStore({
      initialState: {
        participants: {
          ids: ['1'],
          entities: {
            '1': {
              waitingState: 'waiting',
            },
          },
        },
      },
    });
    renderWithProviders(<WaitingParticipantsPopover />, { store, provider: { mui: true } });
    expect(screen.getByTestId('waiting-list-button')).toBeInTheDocument();
  });

  it('should render WaitingParticipantsList when expanded', async () => {
    const user = userEvent.setup();
    const { store } = configureStore({
      initialState: {
        participants: {
          ids: ['1'],
          entities: {
            '1': {
              waitingState: 'waiting',
            },
          },
        },
      },
    });
    renderWithProviders(<WaitingParticipantsPopover />, { store, provider: { mui: true } });
    const button = screen.getByTestId('waiting-list-button');
    await user.click(button);
    expect(screen.getByText('WaitingParticipantsList')).toBeInTheDocument();
  });

  it('should autoclose when participants count reaches 0', async () => {
    const user = userEvent.setup();
    const { store } = configureStore({
      initialState: {
        participants: {
          ids: ['1'],
          entities: {
            '1': {
              waitingState: 'waiting',
            },
          },
        },
      },
    });
    const { unmount } = renderWithProviders(<WaitingParticipantsPopover />, { store, provider: { mui: true } });
    const button = screen.getByTestId('waiting-list-button');
    await user.click(button);
    unmount();
    const { store: secondStore } = configureStore({
      initialState: {
        participants: {
          ids: [],
          entities: {},
        },
      },
    });
    renderWithProviders(<WaitingParticipantsPopover />, { store: secondStore, provider: { mui: true } });
    expect(screen.queryByTestId('waiting-list-button')).not.toBeInTheDocument();
  });
});
