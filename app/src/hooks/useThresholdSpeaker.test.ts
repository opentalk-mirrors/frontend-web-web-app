// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { act, renderHook } from '@testing-library/react';

import { ConnectionIdentifier } from '../types';
import { DEFAULT_THRESHOLD_MS, useThresholdSpeaker } from './useThresholdSpeaker';

const SPEAKER_1 = 'speaker-1' as ConnectionIdentifier;
const SPEAKER_2 = 'speaker-2' as ConnectionIdentifier;
const SPEAKER_3 = 'speaker-3' as ConnectionIdentifier;

describe('useThresholdSpeaker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the initial speaker immediately', () => {
    const { result } = renderHook(() => useThresholdSpeaker({ speakerId: SPEAKER_1 }));

    expect(result.current.stableSpeakerId).toBe(SPEAKER_1);
  });

  it('keeps the previous speaker until the threshold passes', () => {
    const { result, rerender } = renderHook(({ speakerId }) => useThresholdSpeaker({ speakerId }), {
      initialProps: { speakerId: SPEAKER_1 },
    });

    rerender({ speakerId: SPEAKER_2 });

    act(() => {
      vi.advanceTimersByTime(DEFAULT_THRESHOLD_MS - 1);
    });

    expect(result.current.stableSpeakerId).toBe(SPEAKER_1);

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current.stableSpeakerId).toBe(SPEAKER_2);
  });

  it('ignores speakers that do not remain active for the threshold (short noise)', () => {
    const { result, rerender } = renderHook(({ speakerId }) => useThresholdSpeaker({ speakerId }), {
      initialProps: { speakerId: SPEAKER_1 },
    });

    rerender({ speakerId: SPEAKER_2 });

    act(() => {
      vi.advanceTimersByTime(DEFAULT_THRESHOLD_MS / 3);
    });

    rerender({ speakerId: SPEAKER_1 });

    act(() => {
      vi.advanceTimersByTime(DEFAULT_THRESHOLD_MS / 2);
    });

    expect(result.current.stableSpeakerId).toBe(SPEAKER_1);
  });

  it('restarts the threshold when another speaker starts talking before the candidate is stable', () => {
    const { result, rerender } = renderHook(({ speakerId }) => useThresholdSpeaker({ speakerId }), {
      initialProps: { speakerId: SPEAKER_1 },
    });

    rerender({ speakerId: SPEAKER_2 });

    act(() => {
      vi.advanceTimersByTime(DEFAULT_THRESHOLD_MS / 3);
    });

    rerender({ speakerId: SPEAKER_3 });

    act(() => {
      vi.advanceTimersByTime(DEFAULT_THRESHOLD_MS - 1);
    });

    expect(result.current.stableSpeakerId).toBe(SPEAKER_1);

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current.stableSpeakerId).toBe(SPEAKER_3);
  });

  it('switches immediately when the change is pinned (no threshold delay)', () => {
    const { result, rerender } = renderHook(
      ({ speakerId, isPinned }: { speakerId: ConnectionIdentifier; isPinned: boolean }) =>
        useThresholdSpeaker({ speakerId, isPinned }),
      { initialProps: { speakerId: SPEAKER_1, isPinned: false } }
    );

    rerender({ speakerId: SPEAKER_2, isPinned: true });

    expect(result.current.stableSpeakerId).toBe(SPEAKER_2);
  });

  it('cancels a pending threshold switch when a pin selection arrives', () => {
    const { result, rerender } = renderHook(
      ({ speakerId, isPinned }: { speakerId: ConnectionIdentifier; isPinned: boolean }) =>
        useThresholdSpeaker({ speakerId, isPinned }),
      { initialProps: { speakerId: SPEAKER_1, isPinned: false } }
    );

    rerender({ speakerId: SPEAKER_2, isPinned: false });
    act(() => {
      vi.advanceTimersByTime(DEFAULT_THRESHOLD_MS / 3);
    });

    rerender({ speakerId: SPEAKER_3, isPinned: true });
    expect(result.current.stableSpeakerId).toBe(SPEAKER_3);

    act(() => {
      vi.advanceTimersByTime(DEFAULT_THRESHOLD_MS);
    });

    // The previously pending speaker-2 timer must not promote anyone after the pin.
    expect(result.current.stableSpeakerId).toBe(SPEAKER_3);
  });

  it('switches immediately when the featured participant disconnected', () => {
    const { result, rerender } = renderHook(
      ({
        speakerId,
        participantIds,
      }: {
        speakerId: ConnectionIdentifier;
        participantIds: ReadonlySet<ConnectionIdentifier>;
      }) => useThresholdSpeaker({ speakerId, participantIds }),
      {
        initialProps: {
          speakerId: SPEAKER_1,
          participantIds: new Set([SPEAKER_1, SPEAKER_2]),
        },
      }
    );

    expect(result.current.stableSpeakerId).toBe(SPEAKER_1);

    // speaker-1 leaves the room; speaker-2 becomes the new top speaker.
    rerender({ speakerId: SPEAKER_2, participantIds: new Set([SPEAKER_2]) });

    expect(result.current.stableSpeakerId).toBe(SPEAKER_2);
  });

  it('still applies the threshold while the featured participant is still connected', () => {
    const { result, rerender } = renderHook(
      ({
        speakerId,
        participantIds,
      }: {
        speakerId: ConnectionIdentifier;
        participantIds: ReadonlySet<ConnectionIdentifier>;
      }) => useThresholdSpeaker({ speakerId, participantIds }),
      {
        initialProps: {
          speakerId: SPEAKER_1,
          participantIds: new Set([SPEAKER_1, SPEAKER_2]),
        },
      }
    );

    rerender({ speakerId: SPEAKER_2, participantIds: new Set([SPEAKER_1, SPEAKER_2]) });

    act(() => {
      vi.advanceTimersByTime(DEFAULT_THRESHOLD_MS - 1);
    });
    expect(result.current.stableSpeakerId).toBe(SPEAKER_1);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.stableSpeakerId).toBe(SPEAKER_2);
  });

  it('settles without re-render loop when the promoted participant leaves and no speaker remains', () => {
    const { result, rerender } = renderHook(
      ({
        speakerId,
        participantIds,
      }: {
        speakerId?: ConnectionIdentifier;
        participantIds: ReadonlySet<ConnectionIdentifier>;
      }) => useThresholdSpeaker({ speakerId, isPinned: true, participantIds }),
      {
        initialProps: {
          speakerId: SPEAKER_1 as ConnectionIdentifier | undefined,
          participantIds: new Set([SPEAKER_1, SPEAKER_2]),
        },
      }
    );

    expect(result.current.stableSpeakerId).toBe(SPEAKER_1);

    // The pinned/promoted participant leaves; there is no new speaker.
    rerender({ speakerId: undefined, participantIds: new Set([SPEAKER_2]) });

    expect(result.current.stableSpeakerId).toBeNull();

    // A subsequent render with the same empty state must stay stable.
    rerender({ speakerId: undefined, participantIds: new Set([SPEAKER_2]) });

    expect(result.current.stableSpeakerId).toBeNull();
  });

  describe('sustainedActivity (noise-filtered speaking history)', () => {
    it('records the speaker activity timestamp once they hold the floor', () => {
      const spokeAt = new Date('2024-01-01T10:00:00Z');
      const { result } = renderHook(() => useThresholdSpeaker({ speakerId: SPEAKER_1, speakerLastSpokeAt: spokeAt }));

      expect(result.current.sustainedActivity.get(SPEAKER_1)).toBe(spokeAt);
    });

    it('records nothing for a speaker without a speech timestamp (e.g. pinned, never spoke)', () => {
      const { result } = renderHook(() =>
        useThresholdSpeaker({
          speakerId: 'pinned-1' as ConnectionIdentifier,
          isPinned: true,
          speakerLastSpokeAt: undefined,
        })
      );

      expect(result.current.sustainedActivity.has('pinned-1')).toBe(false);
      expect(result.current.sustainedActivity.size).toBe(0);
    });

    it('does not record a short noise that never survives the threshold', () => {
      const spokeAt1 = new Date('2024-01-01T10:00:00Z');
      const noiseSpokeAt = new Date('2024-01-01T10:00:30Z');

      const { result, rerender } = renderHook(
        ({ speakerId, speakerLastSpokeAt }: { speakerId: ConnectionIdentifier; speakerLastSpokeAt: Date }) =>
          useThresholdSpeaker({ speakerId, speakerLastSpokeAt }),
        { initialProps: { speakerId: SPEAKER_1, speakerLastSpokeAt: spokeAt1 } }
      );

      rerender({ speakerId: SPEAKER_2, speakerLastSpokeAt: noiseSpokeAt });
      act(() => {
        vi.advanceTimersByTime(DEFAULT_THRESHOLD_MS / 3);
      });
      rerender({ speakerId: SPEAKER_1, speakerLastSpokeAt: spokeAt1 });
      act(() => {
        vi.advanceTimersByTime(DEFAULT_THRESHOLD_MS / 2);
      });

      expect(result.current.sustainedActivity.has(SPEAKER_2)).toBe(false);
      expect(result.current.sustainedActivity.get(SPEAKER_1)).toBe(spokeAt1);
    });

    it('records a new speaker only after their speech survives the threshold', () => {
      const spokeAt1 = new Date('2024-01-01T10:00:00Z');
      const spokeAt2 = new Date('2024-01-01T10:01:00Z');

      const { result, rerender } = renderHook(
        ({ speakerId, speakerLastSpokeAt }: { speakerId: ConnectionIdentifier; speakerLastSpokeAt: Date }) =>
          useThresholdSpeaker({ speakerId, speakerLastSpokeAt }),
        { initialProps: { speakerId: SPEAKER_1, speakerLastSpokeAt: spokeAt1 } }
      );

      rerender({ speakerId: SPEAKER_2, speakerLastSpokeAt: spokeAt2 });

      expect(result.current.sustainedActivity.has(SPEAKER_2)).toBe(false);

      act(() => {
        vi.advanceTimersByTime(DEFAULT_THRESHOLD_MS);
      });

      expect(result.current.sustainedActivity.get(SPEAKER_2)).toBe(spokeAt2);
      expect(result.current.sustainedActivity.get(SPEAKER_1)).toBe(spokeAt1);
    });

    it('keeps a speaker timestamp frozen while they keep talking', () => {
      const spokeAt1 = new Date('2024-01-01T10:00:00Z');
      const spokeAtLater = new Date('2024-01-01T10:05:00Z');

      const { result, rerender } = renderHook(
        ({ speakerId, speakerLastSpokeAt }: { speakerId: ConnectionIdentifier; speakerLastSpokeAt: Date }) =>
          useThresholdSpeaker({ speakerId, speakerLastSpokeAt }),
        { initialProps: { speakerId: SPEAKER_1, speakerLastSpokeAt: spokeAt1 } }
      );

      rerender({ speakerId: SPEAKER_1, speakerLastSpokeAt: spokeAtLater });

      expect(result.current.sustainedActivity.get(SPEAKER_1)).toBe(spokeAt1);
    });
  });
});
