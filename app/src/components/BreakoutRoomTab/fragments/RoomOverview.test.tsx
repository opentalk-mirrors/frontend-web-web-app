// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { InviteCode, RoomId } from '@opentalk/rest-api-rtk-query';
import { ConfigureStoreOptions } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useParams } from 'react-router-dom';
import { Mock } from 'vitest';

import { stop, switchRoom } from '../../../api/types/outgoing/breakout';
import * as reduxHooks from '../../../hooks/useCustomRedux';
import * as InviteCodeModule from '../../../hooks/useInviteCode';
import { BreakoutRoomId, MeetingNotesAccess, Participant, Role, RoomKind } from '../../../types';
import { renderWithProviders, configureStore, mockedParticipant } from '../../../utils/testUtils';
import RoomOverview from './RoomOverview';

vi.mock('react-router-dom', async (importActual) => ({
  ...(await importActual()),
  useParams: vi.fn(),
}));

vi.mock('./RoomOverviewListItem', () => ({
  __esModule: true,
  default: ({
    breakoutRoomId,
    groupedParticipants,
    joinRoom,
  }: {
    breakoutRoomId: BreakoutRoomId;
    groupedParticipants: Participant[];
    joinRoom: (breakoutRoomId: BreakoutRoomId) => void;
  }) => (
    <div data-testid={`room-${breakoutRoomId}`}>
      <div data-testid={`participants-${breakoutRoomId}`}>
        {groupedParticipants.map((participant) => participant.displayName).join(', ')}
      </div>
      <button type="button" onClick={() => joinRoom(breakoutRoomId)}>
        join-{breakoutRoomId}
      </button>
    </div>
  ),
}));

const breakoutRoomOne = { id: 1 as BreakoutRoomId, name: 'Room 1' };
const breakoutRoomTwo = { id: 2 as BreakoutRoomId, name: 'Room 2' };
const roomId = 'room-id' as RoomId;
const inviteCode = 'invite-code' as InviteCode;

const mockUseParams = useParams as Mock;
const inviteCodeSpy = vi.spyOn(InviteCodeModule, 'useInviteCode');

const buildBaseState = () => {
  const participantOne = { ...mockedParticipant(1), breakoutRoomId: breakoutRoomOne.id };
  const participantTwo = { ...mockedParticipant(2), breakoutRoomId: breakoutRoomTwo.id };
  const participantWhoLeft = {
    ...mockedParticipant(3),
    breakoutRoomId: breakoutRoomOne.id,
    leftAt: '2024-01-01T00:00:00Z',
  };
  const userParticipant = { ...mockedParticipant(4), breakoutRoomId: breakoutRoomOne.id };

  const baseState: ConfigureStoreOptions['preloadedState'] = {
    breakout: {
      loading: false,
      active: true,
      stopped: false,
      expired: false,
      waitForUserSelection: false,
      breakoutRooms: {
        ids: [breakoutRoomOne.id, breakoutRoomTwo.id],
        entities: {
          [breakoutRoomOne.id]: breakoutRoomOne,
          [breakoutRoomTwo.id]: breakoutRoomTwo,
        },
      },
      inParentRoom: [],
      assignment: breakoutRoomOne.id,
      currentBreakoutRoomId: breakoutRoomOne.id,
    },
    participants: {
      ids: [participantOne.id, participantTwo.id, participantWhoLeft.id],
      entities: {
        [participantOne.id]: participantOne,
        [participantTwo.id]: participantTwo,
        [participantWhoLeft.id]: participantWhoLeft,
      },
    },
    user: {
      uuid: userParticipant.id,
      displayName: userParticipant.displayName,
      groups: [],
      role: Role.User,
      meetingNotesAccess: MeetingNotesAccess.None,
      isRoomOwner: false,
      joinedAt: userParticipant.joinedAt,
      lastActive: userParticipant.lastActive,
    },
    room: {
      password: 'room-password',
    },
  };

  return { baseState, participantOne, participantTwo, participantWhoLeft, userParticipant };
};

const createStore = (overrides?: ConfigureStoreOptions['preloadedState']) => {
  const { baseState, participantOne, participantTwo, participantWhoLeft, userParticipant } = buildBaseState();
  const initialState = {
    ...baseState,
    ...overrides,
    breakout: { ...baseState.breakout, ...overrides?.breakout },
    user: { ...baseState.user, ...overrides?.user },
    room: { ...baseState.room, ...overrides?.room },
    participants: overrides?.participants ?? baseState.participants,
  };

  return {
    ...configureStore({
      initialState,
    }),
    participantOne,
    participantTwo,
    participantWhoLeft,
    userParticipant,
  };
};

describe('RoomOverview', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ roomId });
    inviteCodeSpy.mockReturnValue(inviteCode);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows a fallback when there is no expiration timestamp', () => {
    const { store } = createStore();

    renderWithProviders(<RoomOverview />, { store, provider: { mui: true } });

    expect(screen.getByText('breakout-room-room-overview-no-duration')).toBeInTheDocument();
  });

  it('displays remaining minutes when breakout has an expiration time', async () => {
    const addMinutes = (minutes: number) => minutes * 60 * 1000;
    const expires = new Date(Date.now() + addMinutes(5) + 2000).toISOString();
    const { store } = createStore({
      breakout: { expires },
    });

    renderWithProviders(<RoomOverview />, { store, provider: { mui: true } });

    expect(await screen.findByText('5 min')).toBeInTheDocument();
  });

  it('groups online participants by breakout room and ignores users who left', () => {
    const { store, participantOne, participantTwo, participantWhoLeft, userParticipant } = createStore();

    renderWithProviders(<RoomOverview />, { store, provider: { mui: true } });

    const firstRoomParticipants = screen.getByTestId(`participants-${breakoutRoomOne.id}`).textContent ?? '';
    expect(firstRoomParticipants).toContain(userParticipant.displayName);
    expect(firstRoomParticipants).toContain(participantOne.displayName);
    expect(firstRoomParticipants).not.toContain(participantWhoLeft.displayName);
    expect(screen.getByTestId(`participants-${breakoutRoomTwo.id}`)).toHaveTextContent(participantTwo.displayName);
  });

  it('dispatches a stop action when the close button is clicked', async () => {
    const mockDispatch = vi.fn();
    const dispatchSpy = vi.spyOn(reduxHooks, 'useAppDispatch').mockReturnValue(mockDispatch);
    const { store } = createStore();

    renderWithProviders(<RoomOverview />, { store, provider: { mui: true } });

    await userEvent.click(screen.getByRole('button', { name: 'breakout-room-room-overview-button-close' }));

    expect(mockDispatch).toHaveBeenCalledWith(stop.action({}));
    dispatchSpy.mockRestore();
  });

  it('dispatches switchRoom action when joining a breakout room', async () => {
    const { store, dispatchSpy } = createStore();

    renderWithProviders(<RoomOverview />, { store, provider: { mui: true } });

    await userEvent.click(screen.getByRole('button', { name: `join-${breakoutRoomTwo.id}` }));

    expect(dispatchSpy).toHaveBeenCalledWith(
      switchRoom.action({
        kind: RoomKind.Breakout,
        id: breakoutRoomTwo.id,
      })
    );
  });
});
