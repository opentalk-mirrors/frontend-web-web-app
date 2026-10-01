// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  selectParticipantAvatarUrl,
  selectParticipantName,
  selectParticipationKind,
} from '../store/slices/participantsSlice';
import { ParticipantId, ParticipationKind } from '../types';
import { useAppSelector } from './useCustomRedux';

export const useParticipantFallbackProps = (participantId: ParticipantId) => {
  const displayName = useAppSelector((state) => selectParticipantName(state, participantId));
  const avatarUrl = useAppSelector((state) => selectParticipantAvatarUrl(state, participantId));
  const participationKind = useAppSelector((state) => selectParticipationKind(state, participantId));

  return {
    displayName,
    avatarUrl,
    isSipParticipant: participationKind === ParticipationKind.CallIn,
  };
};
