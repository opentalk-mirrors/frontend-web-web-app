// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useEffect, useState } from 'react';

import { ConnectionIdentifier } from '../types';

type SpeakerId = ConnectionIdentifier | undefined | null;

export const DEFAULT_THRESHOLD_MS = 1500 as const;

interface UseThresholdSpeakerOptions {
  speakerId: SpeakerId;
  isPinned?: boolean;
  participantIds?: ReadonlySet<ConnectionIdentifier> | readonly string[];
  speakerLastSpokeAt?: Date;
}

interface ThresholdSpeakerResult {
  stableSpeakerId: SpeakerId;
  // noise-filtered counterpart of LiveKit's raw `lastSpokeAt`
  sustainedActivity: ReadonlyMap<string, Date>;
}

function isPresent(id: SpeakerId, ids: UseThresholdSpeakerOptions['participantIds']): boolean {
  if (!id) {
    return false;
  }
  if (!ids) {
    return true;
  }
  if (Array.isArray(ids)) {
    return ids.includes(id);
  }
  return (ids as ReadonlySet<string>).has(id);
}

/**
 * Smooths the active-speaker selection so dependent UI does not flicker during a
 * back-and-forth conversation or on brief background noises (a cough, typing, ...)
 *
 * The threshold is bypassed when:
 *  - there is no current featured speaker yet (cold start)
 *  - the currently featured participant left the room
 */
export function useThresholdSpeaker({
  speakerId,
  isPinned = false,
  participantIds,
  speakerLastSpokeAt,
}: UseThresholdSpeakerOptions): ThresholdSpeakerResult {
  const candidateId: SpeakerId = speakerId ?? null;
  const [stableSpeakerId, setStableSpeakerId] = useState<SpeakerId>(candidateId);
  const [activity, setActivity] = useState<{ recordedSpeakerId: string | null; recordedSpeakerMap: Map<string, Date> }>(
    () => ({
      recordedSpeakerId: null,
      recordedSpeakerMap: new Map(),
    })
  );

  const stableSpeakerStillPresent = isPresent(stableSpeakerId, participantIds);
  const shouldSwitchImmediately =
    candidateId !== stableSpeakerId && (isPinned || !stableSpeakerId || !stableSpeakerStillPresent);

  if (shouldSwitchImmediately) {
    setStableSpeakerId(candidateId);
  }

  const effectiveStableSpeakerId = shouldSwitchImmediately ? candidateId : stableSpeakerId;

  // Mark a participant once they become the stable speaker. The `=== candidateId`
  // guard ensures `speakerLastSpokeAt` belongs to them (not a still-pending old speaker)
  let sustainedActivity: ReadonlyMap<string, Date> = activity.recordedSpeakerMap;
  const shouldRecordActivity =
    effectiveStableSpeakerId != null &&
    effectiveStableSpeakerId === candidateId &&
    effectiveStableSpeakerId !== activity.recordedSpeakerId &&
    speakerLastSpokeAt != null;

  if (shouldRecordActivity) {
    const speakerIdentityMapping = new Map(activity.recordedSpeakerMap);
    speakerIdentityMapping.set(effectiveStableSpeakerId, speakerLastSpokeAt);
    setActivity({ recordedSpeakerId: effectiveStableSpeakerId, recordedSpeakerMap: speakerIdentityMapping });
    sustainedActivity = speakerIdentityMapping;
  }

  const needsThresholdTimer =
    !shouldSwitchImmediately && !isPinned && candidateId != null && candidateId !== stableSpeakerId;

  useEffect(() => {
    if (!needsThresholdTimer) {
      return;
    }
    const handler = setTimeout(() => {
      setStableSpeakerId(candidateId);
    }, DEFAULT_THRESHOLD_MS);
    return () => clearTimeout(handler);
  }, [needsThresholdTimer, candidateId]);

  return { stableSpeakerId: effectiveStableSpeakerId, sustainedActivity };
}
