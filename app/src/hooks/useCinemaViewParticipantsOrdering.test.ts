// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { act } from '@testing-library/react';
import { waitFor } from '@testing-library/react';

import { CinemaViewSortOrder } from '../store/slices/common';
import { updatedCinemaViewSortOrder } from '../store/slices/uiSlice';
import { ConnectionId, ParticipantId } from '../types';
import { configureStore, renderHookWithProviders } from '../utils/testUtils';
import { useCinemaViewParticipantsOrdering } from './useCinemaViewParticipantsOrdering';

type MockedParticipant = {
  id: ParticipantId;
  connections: ConnectionId[];
  identity: string;
  lastSpokeAt?: Date;
  isSpeaking?: boolean;
};

type HookProps = {
  participants: Array<MockedParticipant>;
};

const getMockedParticipants = (count: number): Array<MockedParticipant> => {
  return Array.from({ length: count }, (_, index) => ({
    id: `00000000-e6b4-4759-00${index}` as ParticipantId,
    connections: [`10000000-e6b4-4759-00${index}` as ConnectionId],
    identity: `00000000-e6b4-4759-00${index}:10000000-e6b4-4759-00${index}`,
    lastSpokeAt: undefined,
    isSpeaking: false,
  }));
};

const useCurrentSpeakerMock = vi.fn().mockReturnValue(null);
vi.mock('./useCurrentSpeaker', () => ({
  useCurrentSpeaker: () => useCurrentSpeakerMock(),
}));

const useIsMobileMock = vi.fn().mockReturnValue(false);
vi.mock('./useMediaQuery', () => ({
  useIsMobile: () => useIsMobileMock(),
}));

const selectPaginationPageStateMock = vi.fn().mockReturnValue(1);
vi.mock('../store/slices/uiSlice', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('../store/slices/uiSlice');
  return {
    ...actual,
    selectPaginationPageState: () => selectPaginationPageStateMock(),
  };
});

const SHARED_INITIAL_STATE = {
  initialState: {
    ui: {
      cinemaGridSize: 9,
      activeSpeakerFirstEnabled: true,
    },
  },
} as const;

describe('useCinemaViewParticipantsOrdering', () => {
  it('returns paginated participants.', () => {
    const participants = getMockedParticipants(20);
    const { store } = configureStore(SHARED_INITIAL_STATE);
    const { result } = renderHookWithProviders(() => useCinemaViewParticipantsOrdering(participants), { store });
    expect(result.current).toHaveProperty('length', 9);
  });

  it('returns participants as is when no one is currently speaking', () => {
    const participants = getMockedParticipants(20);
    const { store } = configureStore(SHARED_INITIAL_STATE);
    const { result } = renderHookWithProviders(() => useCinemaViewParticipantsOrdering(participants), { store });
    expect(result.current).toEqual(participants.slice(0, 9));
  });

  it('returns participants as is when the current speaker is on the first page already', () => {
    const participants = getMockedParticipants(20);
    useCurrentSpeakerMock.mockReturnValue(participants[5].identity);
    const { store } = configureStore(SHARED_INITIAL_STATE);
    const { result } = renderHookWithProviders(() => useCinemaViewParticipantsOrdering(participants), { store });
    expect(result.current).toEqual(participants.slice(0, 9));
  });

  it('places the current speaker on the first page regardless of their position in the original list', () => {
    const participants = getMockedParticipants(20);
    useCurrentSpeakerMock.mockReturnValue(participants[12].identity);
    const { store } = configureStore(SHARED_INITIAL_STATE);
    const { result } = renderHookWithProviders(() => useCinemaViewParticipantsOrdering(participants), { store });
    expect(result.current).toContainEqual(participants[12]);
  });

  it('places the current speaker on the first page in place of the participant who never spoke', () => {
    const participants = getMockedParticipants(20);
    participants[0].lastSpokeAt = new Date();
    participants[1].lastSpokeAt = new Date();
    participants[2].lastSpokeAt = new Date();
    useCurrentSpeakerMock.mockReturnValue(participants[12].identity);
    const { store } = configureStore(SHARED_INITIAL_STATE);
    const { result } = renderHookWithProviders(() => useCinemaViewParticipantsOrdering(participants), { store });
    expect(result.current[3]).toEqual(participants[12]);
    expect(result.current).not.toContainEqual(participants[3]);
    expect(result.current).toContainEqual(participants[0]);
    expect(result.current).toContainEqual(participants[1]);
    expect(result.current).toContainEqual(participants[2]);
  });

  it('places the current speaker on the first page in place of the least recently spoke participant', () => {
    const participants = getMockedParticipants(10);
    for (let i = 0; i < 9; i++) {
      participants[i].lastSpokeAt = new Date(`2024-01-01T0${i + 1}:00:00Z`);
    }
    useCurrentSpeakerMock.mockReturnValue(participants[9].identity);
    const { store } = configureStore(SHARED_INITIAL_STATE);
    const { result } = renderHookWithProviders(() => useCinemaViewParticipantsOrdering(participants), { store });
    expect(result.current[0]).toEqual(participants[9]);
  });

  it('places the current speaker on the first page in place of the least recently spoke participant (reversed)', () => {
    const participants = getMockedParticipants(10);
    for (let i = 0; i < 9; i++) {
      participants[i].lastSpokeAt = new Date(`2024-01-01T0${9 - i}:00:00Z`);
    }
    useCurrentSpeakerMock.mockReturnValue(participants[9].identity);
    const { store } = configureStore(SHARED_INITIAL_STATE);
    const { result } = renderHookWithProviders(() => useCinemaViewParticipantsOrdering(participants), { store });
    expect(result.current[8]).toEqual(participants[9]);
  });

  it('new current speaker takes place of a least recently spoken participant, complementing other one on the first page', () => {
    const participants = getMockedParticipants(11);
    for (let i = 0; i < 9; i++) {
      participants[i].lastSpokeAt = new Date(`2024-01-01T0${i + 1}:00:00Z`);
    }
    participants[9].lastSpokeAt = new Date(`2024-01-01T09:00:00Z`);
    useCurrentSpeakerMock.mockReturnValue(participants[9].identity);
    const { store } = configureStore(SHARED_INITIAL_STATE);
    const { result, rerender } = renderHookWithProviders(() => useCinemaViewParticipantsOrdering(participants), {
      store,
    });
    expect(result.current[0]).toEqual(participants[9]);
    participants[10].lastSpokeAt = new Date(`2024-01-01T10:00:00Z`);
    useCurrentSpeakerMock.mockReturnValue(participants[10].identity);
    rerender();
    expect(result.current[0]).toEqual(participants[9]);
    expect(result.current[1]).toEqual(participants[10]);
  });

  it('removes participants who left the call from the order', () => {
    const participants = getMockedParticipants(10);
    useCurrentSpeakerMock.mockReturnValue(participants[9].identity);
    const { store } = configureStore(SHARED_INITIAL_STATE);
    const { result, rerender } = renderHookWithProviders(
      (props: HookProps) => useCinemaViewParticipantsOrdering(props.participants),
      {
        store,
        options: {
          initialProps: { participants },
        },
      }
    );
    expect(result.current[0]).toEqual(participants[9]);
    const updatedParticipants = participants.slice(1);
    rerender({ participants: updatedParticipants });
    expect(result.current[0]).toEqual(participants[9]);
  });

  it('adds new participants to the end of the order', () => {
    const participants = getMockedParticipants(10);
    useCurrentSpeakerMock.mockReturnValue(participants[0].identity);
    const { store } = configureStore(SHARED_INITIAL_STATE);
    const { result, rerender } = renderHookWithProviders(
      (props: HookProps) => useCinemaViewParticipantsOrdering(props.participants),
      {
        store,
        options: {
          initialProps: { participants: participants.slice(0, 8) },
        },
      }
    );
    expect(result.current[0]).toEqual(participants[0]);
    rerender({ participants: participants.slice(0, 9) });
    expect(result.current).toHaveLength(9);
    expect(result.current[8]).toEqual(participants[8]);
  });

  it('treats same id with a new connection as a new entity and appends it', () => {
    const participants = getMockedParticipants(8);
    const participantWithNewConnection = {
      ...participants[0],
      connections: ['10000000-e6b4-4759-0099' as ConnectionId],
      identity: `${participants[0].id}:10000000-e6b4-4759-0099`,
    };
    const { store } = configureStore(SHARED_INITIAL_STATE);
    const { result, rerender } = renderHookWithProviders(
      (props: HookProps) => useCinemaViewParticipantsOrdering(props.participants),
      {
        store,
        options: {
          initialProps: { participants },
        },
      }
    );

    expect(result.current).toHaveLength(8);
    rerender({ participants: [...participants, participantWithNewConnection] });
    expect(result.current).toHaveLength(9);
    expect(result.current[8]).toEqual(participantWithNewConnection);
  });

  it('resets the order when the sort criterion changes', async () => {
    const participants = getMockedParticipants(10);
    useCurrentSpeakerMock.mockReturnValue(participants[9].identity);
    const { store } = configureStore(SHARED_INITIAL_STATE);
    const { result, rerender } = renderHookWithProviders(
      (props: HookProps) => useCinemaViewParticipantsOrdering(props.participants),
      {
        store,
        options: {
          initialProps: { participants },
        },
      }
    );
    expect(result.current).not.toEqual(participants.slice(0, 9));
    useCurrentSpeakerMock.mockReturnValue('');
    const currentSortOrder = store.getState().ui.cinemaViewOrder;
    const nextSortOrder =
      currentSortOrder === CinemaViewSortOrder.VideoFirst
        ? CinemaViewSortOrder.FirstJoined
        : CinemaViewSortOrder.VideoFirst;
    act(() => {
      store.dispatch(updatedCinemaViewSortOrder(nextSortOrder));
    });
    rerender({ participants });
    await waitFor(() => {
      expect(result.current).toEqual(participants.slice(0, 9));
    });
  });

  it('does not swap when the current speaker is already on the first page after reconciliation', () => {
    const participants = getMockedParticipants(10);
    for (let i = 0; i < 9; i++) {
      participants[i].lastSpokeAt = new Date(`2024-01-01T0${i + 1}:00:00Z`);
    }
    useCurrentSpeakerMock.mockReturnValue(participants[9].identity);
    const { store } = configureStore(SHARED_INITIAL_STATE);
    const { result, rerender } = renderHookWithProviders(() => useCinemaViewParticipantsOrdering(participants), {
      store,
    });
    expect(result.current[0]).toEqual(participants[9]);

    useCurrentSpeakerMock.mockReturnValue(participants[8].identity);
    rerender();

    expect(result.current[0]).toEqual(participants[9]);
    expect(result.current[8]).toEqual(participants[8]);
  });

  it('preserves order when current speaker becomes empty or undefined after a prior swap', () => {
    const participants = getMockedParticipants(10);
    for (let i = 0; i < 9; i++) {
      participants[i].lastSpokeAt = new Date(`2024-01-01T0${i + 1}:00:00Z`);
    }
    useCurrentSpeakerMock.mockReturnValue(participants[9].identity);
    const { store } = configureStore(SHARED_INITIAL_STATE);
    const { result, rerender } = renderHookWithProviders(() => useCinemaViewParticipantsOrdering(participants), {
      store,
    });
    expect(result.current[0]).toEqual(participants[9]);
    useCurrentSpeakerMock.mockReturnValue('');
    rerender();
    expect(result.current[0]).toEqual(participants[9]);
  });

  it('reapplies current speaker promotion after the sort criterion changes', () => {
    const participants = getMockedParticipants(10);
    for (let i = 0; i < 9; i++) {
      participants[i].lastSpokeAt = new Date(`2024-01-01T0${i + 1}:00:00Z`);
    }
    useCurrentSpeakerMock.mockReturnValue(participants[9].identity);
    const { store } = configureStore(SHARED_INITIAL_STATE);
    const { result } = renderHookWithProviders(() => useCinemaViewParticipantsOrdering(participants), { store });
    expect(result.current[0]).toEqual(participants[9]);
    store.dispatch(updatedCinemaViewSortOrder(CinemaViewSortOrder.VideoFirst));
    expect(result.current[0]).toEqual(participants[9]);
  });

  it('does not perform any swap when activeSpeakerFirstEnabled is false', () => {
    const participants = getMockedParticipants(10);
    for (let i = 0; i < 9; i++) {
      participants[i].lastSpokeAt = new Date(`2024-01-01T0${i + 1}:00:00Z`);
    }
    useCurrentSpeakerMock.mockReturnValue(participants[9].identity);
    const { store } = configureStore({
      initialState: {
        ui: {
          cinemaGridSize: 9,
          activeSpeakerFirstEnabled: false,
        },
      },
    });
    const { result } = renderHookWithProviders(() => useCinemaViewParticipantsOrdering(participants), { store });
    expect(result.current[0]).not.toEqual(participants[9]);
  });
});
