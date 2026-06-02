// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SceneBounds } from '@excalidraw/excalidraw/element/bounds';

import type { RootState } from '../../../store';
import type { Namespaced, ParticipantId } from '../../../types';
import { createModule } from '../../../types/matchBuilder';
import { createSignalingApiCall } from '../../createSignalingApiCall';
import type { ExcalidrawScene, ExcalidrawVolatileData, WhiteboardScene } from '../incoming/whiteboard';
import { sendMessage } from './common';

export interface DisabledEditRestrictions {
  type: 'disabled';
}

export interface EnabledEditRestrictions {
  type: 'enabled';
  unrestrictedParticipants: ParticipantId[];
}

export type EditRestrictions = DisabledEditRestrictions | EnabledEditRestrictions;

export interface Start {
  action: 'start';
  initialScene?: WhiteboardScene;
  editRestrictions: EditRestrictions;
}

export interface Broadcast {
  action: 'broadcast';
  data: Omit<ExcalidrawScene, 'appState'>;
}

export interface BroadcastVolatile {
  action: 'broadcast_volatile';
  data:
    | (Omit<ExcalidrawVolatileData, 'pointersMap'> & {
        selectedElementIds: Readonly<{ [id: string]: true }>;
      })
    | { sceneBounds: SceneBounds };
}

export interface StoreScene {
  action: 'store_scene';
  scene: ExcalidrawScene;
}

export interface Follow {
  action: 'follow';
  participantId: ParticipantId;
}

export interface Unfollow {
  action: 'unfollow';
  participantId: ParticipantId;
}

export interface EnableEditRestrictions {
  action: 'enable_edit_restrictions';
  unrestrictedParticipants: ParticipantId[];
}

export interface DisableEditRestrictions {
  action: 'disable_edit_restrictions';
}

export type Action =
  | Start
  | Broadcast
  | BroadcastVolatile
  | StoreScene
  | Follow
  | Unfollow
  | EnableEditRestrictions
  | DisableEditRestrictions
  | StartWhiteboard
  | GenerateWhiteboardPdf;
export type Whiteboard = Namespaced<Action, 'whiteboard'>;

// Spacedeck block start
export interface StartWhiteboard {
  action: 'initialize';
}

export interface GenerateWhiteboardPdf {
  action: 'generate_pdf';
}

export const startWhiteboard = createSignalingApiCall<StartWhiteboard>('whiteboard', 'initialize');
export const generateWhiteboardPdf = createSignalingApiCall<GenerateWhiteboardPdf>('whiteboard', 'generate_pdf');
// spacedeck block end

export const start = createSignalingApiCall<Start>('excalidraw', 'start');
export const broadcast = createSignalingApiCall<Broadcast>('excalidraw', 'broadcast');
export const broadcastVolatile = createSignalingApiCall<BroadcastVolatile>('excalidraw', 'broadcast_volatile');
export const storeScene = createSignalingApiCall<StoreScene>('excalidraw', 'store_scene');
export const follow = createSignalingApiCall<Follow>('excalidraw', 'follow');
export const unfollow = createSignalingApiCall<Unfollow>('excalidraw', 'unfollow');
export const enableEditRestrictions = createSignalingApiCall<EnableEditRestrictions>(
  'excalidraw',
  'enable_edit_restrictions'
);
export const disableEditRestrictions = createSignalingApiCall<DisableEditRestrictions>(
  'excalidraw',
  'disable_edit_restrictions'
);

export const handler = createModule<RootState>((builder) => {
  builder
    .addCase(startWhiteboard.action, (_state, { payload }) => {
      sendMessage(startWhiteboard(payload));
    })
    .addCase(generateWhiteboardPdf.action, (_state, { payload }) => {
      sendMessage(generateWhiteboardPdf(payload));
    })
    .addCase(start.action, (_state, { payload }) => {
      sendMessage(start(payload));
    })
    .addCase(broadcast.action, (_state, { payload }) => {
      sendMessage(broadcast(payload));
    })
    .addCase(broadcastVolatile.action, (_state, { payload }) => {
      sendMessage(broadcastVolatile(payload));
    })
    .addCase(storeScene.action, (_state, { payload }) => {
      sendMessage(storeScene(payload));
    })
    .addCase(follow.action, (_state, { payload }) => {
      sendMessage(follow(payload));
    })
    .addCase(unfollow.action, (_state, { payload }) => {
      sendMessage(unfollow(payload));
    })
    .addCase(enableEditRestrictions.action, (_state, { payload }) => {
      sendMessage(enableEditRestrictions(payload));
    })
    .addCase(disableEditRestrictions.action, (_state) => {
      sendMessage(disableEditRestrictions());
    });
});

export default Whiteboard;
