// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, screen } from '@testing-library/react';

import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import WaitingParticipantsPopover from './WaitingParticipantsPopover';

jest.mock('../../WaitingParticipantsList', () => ({
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
    renderWithProviders(<WaitingParticipantsPopover />, { store });
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
    renderWithProviders(<WaitingParticipantsPopover />, { store });
    expect(screen.getByTestId('waiting-list-button')).toBeInTheDocument();
  });

  it('should render WaitingParticipantsList when expanded', () => {
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
    renderWithProviders(<WaitingParticipantsPopover />, { store });
    const button = screen.getByTestId('waiting-list-button');
    fireEvent.click(button);
    expect(screen.getByText('WaitingParticipantsList')).toBeInTheDocument();
  });

  it('should autoclose when participants count reaches 0', () => {
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
    const { unmount } = renderWithProviders(<WaitingParticipantsPopover />, { store });
    const button = screen.getByTestId('waiting-list-button');
    fireEvent.click(button);
    unmount();
    const { store: secondStore } = configureStore({
      initialState: {
        participants: {
          ids: [],
          entities: {},
        },
      },
    });
    renderWithProviders(<WaitingParticipantsPopover />, { store: secondStore });
    expect(screen.queryByTestId('waiting-list-button')).not.toBeInTheDocument();
  });
});
