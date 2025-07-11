// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { RootState } from '../../../store';
import { Namespaced, ParticipantId, createModule } from '../../../types';
import { createSignalingApiCall } from '../../createSignalingApiCall';
import { sendMessage } from './common';

export interface EnableRaiseHands {
  action: 'enable_raise_hands';
}

export interface DisableRaiseHands {
  action: 'disable_raise_hands';
}

export interface RaiseHand {
  action: 'raise_hand';
}

export interface LowerHand {
  action: 'lower_hand';
}

export interface ResetRaisedHands {
  action: 'reset_raised_hands';
  target?: Array<ParticipantId>;
}

export type Action = EnableRaiseHands | DisableRaiseHands | RaiseHand | LowerHand | ResetRaisedHands;

export type RaiseHands = Namespaced<Action, 'raise_hands'>;

export const enableRaiseHands = createSignalingApiCall<EnableRaiseHands>('raise_hands', 'enable_raise_hands');
export const disableRaiseHands = createSignalingApiCall<DisableRaiseHands>('raise_hands', 'disable_raise_hands');
export const raiseHand = createSignalingApiCall<RaiseHand>('raise_hands', 'raise_hand');
export const lowerHand = createSignalingApiCall<LowerHand>('raise_hands', 'lower_hand');
export const resetRaisedHands = createSignalingApiCall<ResetRaisedHands>('raise_hands', 'reset_raised_hands');

export const handler = createModule<RootState>((builder) => {
  builder
    .addCase(raiseHand.action, () => {
      sendMessage(raiseHand());
    })
    .addCase(lowerHand.action, () => {
      sendMessage(lowerHand());
    })
    .addCase(enableRaiseHands.action, () => {
      sendMessage(enableRaiseHands());
    })
    .addCase(disableRaiseHands.action, () => {
      sendMessage(disableRaiseHands());
    })
    .addCase(resetRaisedHands.action, (_state, action) => {
      sendMessage(resetRaisedHands(action.payload));
    });
});

export default RaiseHands;
