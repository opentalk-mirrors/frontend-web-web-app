// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ParticipantId, ParticipationKind } from '../types';
import { configureStore, mockStore, mockedParticipant, renderHookWithProviders } from '../utils/testUtils';
import { useParticipantFallbackProps } from './useParticipantFallbackProps';

describe('useParticipantFallbackProps', () => {
  it('resolves the display name of a known participant', () => {
    const participant = mockedParticipant(0);
    const { store } = mockStore(1);

    const { result } = renderHookWithProviders(() => useParticipantFallbackProps(participant.id), { store });

    expect(result.current.displayName).toBe(participant.displayName);
  });

  it('passes through the avatar url', () => {
    const participant = { ...mockedParticipant(0), avatarUrl: 'https://example.test/avatar.png' };
    const { store } = configureStore({
      initialState: {
        participants: {
          ids: [participant.id],
          entities: { [participant.id]: participant },
        },
      },
    });

    const { result } = renderHookWithProviders(() => useParticipantFallbackProps(participant.id), { store });

    expect(result.current.avatarUrl).toBe('https://example.test/avatar.png');
  });

  it('marks call-in participants as SIP', () => {
    const participant = mockedParticipant(0);
    const { store } = mockStore(1, { participantKinds: [ParticipationKind.CallIn] });

    const { result } = renderHookWithProviders(() => useParticipantFallbackProps(participant.id), { store });

    expect(result.current.isSipParticipant).toBe(true);
  });

  it('does not mark registered participants as SIP', () => {
    const participant = mockedParticipant(0);
    const { store } = mockStore(1, { participantKinds: [ParticipationKind.Registered] });

    const { result } = renderHookWithProviders(() => useParticipantFallbackProps(participant.id), { store });

    expect(result.current.isSipParticipant).toBe(false);
  });

  it('returns undefined fields for an id that is not in the store', () => {
    const { store } = mockStore(1);
    const unknownId = '00000000-0000-0000-0000-000000000000' as ParticipantId;

    const { result } = renderHookWithProviders(() => useParticipantFallbackProps(unknownId), { store });

    expect(result.current).toEqual({
      displayName: undefined,
      avatarUrl: undefined,
      isSipParticipant: false,
    });
  });
});
