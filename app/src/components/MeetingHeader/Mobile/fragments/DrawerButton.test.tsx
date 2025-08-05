// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, screen } from '@testing-library/react';

import { configureStore, renderWithProviders } from '../../../../utils/testUtils';
import { DrawerButton } from './DrawerButton';

jest.mock('react-i18next', () => ({
  ...jest.requireActual('react-i18next'),
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('../../fragments/Indicator', () => ({
  __esModule: true,
  Indicator: () => <div data-testid="indicator" />,
}));

describe('DrawerButton indicator rendering logic', () => {
  it('should not show any indicators when all counts are zero', () => {
    const { store } = configureStore({
      initialState: {},
    });
    renderWithProviders(<DrawerButton onClick={() => {}} />, { store });
    expect(screen.queryByTestId('indicator')).not.toBeInTheDocument();
  });

  it("should show indicator when there's an unread global message", () => {
    const { store } = configureStore({
      initialState: {
        chat: {
          scope: {
            global: {
              messages: {
                ids: ['1'],
                entities: {
                  1: {
                    id: '1',
                    scope: 'global',
                    content: 'Test message',
                    timestamp: new Date(Date.now()).toISOString(),
                  },
                },
              },
              nextIndex: null,
              lastSeenTimestamp: new Date(Date.now() - 1000).toISOString(),
            },
          },
        },
      },
    });
    renderWithProviders(<DrawerButton onClick={() => {}} />, { store });
    expect(screen.getByTestId('indicator')).toBeInTheDocument();
  });

  it("should show indicator when there's an unread personal message", () => {
    const { store } = configureStore({
      initialState: {
        chat: {
          scope: {
            global: {
              messages: {
                ids: ['1'],
                entities: {
                  1: {
                    id: '1',
                    scope: 'private',
                    content: 'Test message',
                    timestamp: new Date(Date.now()).toISOString(),
                  },
                },
              },
              nextIndex: null,
              lastSeenTimestamp: new Date(Date.now() - 1000).toISOString(),
            },
          },
        },
      },
    });
    renderWithProviders(<DrawerButton onClick={() => {}} />, { store });
    expect(screen.getByTestId('indicator')).toBeInTheDocument();
  });

  it("should show indicator when there's a highlighted whiteboard", () => {
    const { store } = configureStore({
      initialState: {
        ui: {
          isCurrentWhiteboardHighlighted: true,
        },
      },
    });
    renderWithProviders(<DrawerButton onClick={() => {}} />, { store });
    expect(screen.getByTestId('indicator')).toBeInTheDocument();
  });

  it('should not show indicator when there are participants waiting and user is not a moderator', () => {
    const { store } = configureStore({
      initialState: {
        user: {
          role: 'user',
        },
        participants: {
          ids: ['1'],
          entities: { 1: { id: '1', waitingState: 'waiting' } },
        },
      },
    });
    renderWithProviders(<DrawerButton onClick={() => {}} />, { store });
    expect(screen.queryByTestId('indicator')).not.toBeInTheDocument();
  });

  it('should show indicator when there are participants waiting and user is a moderator', () => {
    const { store } = configureStore({
      initialState: {
        user: {
          role: 'moderator',
        },
        participants: {
          ids: ['1'],
          entities: { 1: { id: '1', waitingState: 'waiting' } },
        },
      },
    });
    renderWithProviders(<DrawerButton onClick={() => {}} />, { store });
    expect(screen.getByTestId('indicator')).toBeInTheDocument();
  });

  it('should not show indicator when there are polls and votes and user has seen them', () => {
    const { store } = configureStore({
      initialState: {
        user: {
          role: 'moderator',
        },
        ui: {
          haveSeenMobilePollsAndVotes: true,
        },
        legalVote: {
          votes: {
            ids: ['1'],
            entities: { 1: { id: '1' } },
          },
        },
      },
    });
    renderWithProviders(<DrawerButton onClick={() => {}} />, { store });
    expect(screen.queryByTestId('indicator')).not.toBeInTheDocument();
  });

  it('should show indicator when there are polls and votes and user has not seen them', () => {
    const { store } = configureStore({
      initialState: {
        user: {
          role: 'user',
        },
        ui: {
          haveSeenMobilePollsAndVotes: false,
        },
        legalVote: {
          votes: {
            ids: ['1'],
            entities: { 1: { id: '1' } },
          },
        },
      },
    });
    renderWithProviders(<DrawerButton onClick={() => {}} />, { store });
    expect(screen.getByTestId('indicator')).toBeInTheDocument();
  });
});

describe('DrawerButton callback logic', () => {
  it('should call onClick when the button is clicked', () => {
    const { store } = configureStore({
      initialState: {},
    });
    const onClickMock = jest.fn();
    renderWithProviders(<DrawerButton onClick={onClickMock} />, { store });
    const button = screen.getByRole('button', { name: 'mobile-drawer-button-label' });
    fireEvent.click(button);
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });
});
