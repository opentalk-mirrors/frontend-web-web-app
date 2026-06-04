// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { RootState } from '../../../store';
import { Namespaced, ParticipantId, createModule } from '../../../types';
import { ReactionEmoji } from '../../../types/reaction';
import { createSignalingApiCall } from '../../createSignalingApiCall';
import { sendMessage } from './common';

export interface ReactCommand {
  action: 'react';
  reaction: ReactionEmoji;
}

export interface EnableRestrictions {
  action: 'enable_restrictions';
  unrestrictedParticipants: ParticipantId[];
}

export interface DisableRestrictions {
  action: 'disable_restrictions';
}

export type Action = ReactCommand | EnableRestrictions | DisableRestrictions;

export type Reaction = Namespaced<Action, 'reaction'>;

export const reactCommand = createSignalingApiCall<ReactCommand>('reaction', 'react');
export const enableReactionRestrictions = createSignalingApiCall<EnableRestrictions>('reaction', 'enable_restrictions');
export const disableReactionRestrictions = createSignalingApiCall<DisableRestrictions>(
  'reaction',
  'disable_restrictions'
);

export const handler = createModule<RootState>((builder) => {
  builder
    .addCase(reactCommand.action, (_state, action) => {
      sendMessage(reactCommand(action.payload));
    })
    .addCase(enableReactionRestrictions.action, (_state, action) => {
      sendMessage(enableReactionRestrictions(action.payload));
    })
    .addCase(disableReactionRestrictions.action, () => {
      sendMessage(disableReactionRestrictions());
    });
});

export default Reaction;
