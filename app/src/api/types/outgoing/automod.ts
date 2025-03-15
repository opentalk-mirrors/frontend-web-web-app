// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  AutomodSelectionStrategy,
  createModule,
  createSignalingApiCall,
  AutomodStartBase,
  Command,
  Namespaced,
  ParticipantId,
} from '../../../types';
import { sendMessage } from './common';

export interface AutomodStartCommand extends Command, AutomodStartBase {
  action: 'start';
}

export interface AutomodStopCommand extends Command {
  action: 'stop';
}

export interface AutomodEditCommand extends Command {
  action: 'edit';
}

export enum AutomodSelectHow {
  None = 'none',
  Random = 'random',
  Specific = 'specific',
  Next = 'next',
}

export interface AutomodSelectCommand extends Command {
  action: 'select';
  how: AutomodSelectHow;
}

export interface AutomodSelectNoneCommand extends AutomodSelectCommand {
  how: AutomodSelectHow.None;
}

export interface AutomodSelectRandomCommand extends AutomodSelectCommand {
  how: AutomodSelectHow.Random;
}

export interface AutomodSelectSpecificCommand extends AutomodSelectCommand {
  how: AutomodSelectHow.Specific;
  participant: ParticipantId;
  keepInRemaining: boolean;
}

export interface AutomodSelectNextCommand extends AutomodSelectCommand {
  how: AutomodSelectHow.Next;
}

export type SelectCommandType =
  | AutomodSelectNoneCommand
  | AutomodSelectRandomCommand
  | AutomodSelectSpecificCommand
  | AutomodSelectNextCommand;

export interface AutomodYieldCommand extends Command {
  action: 'yield';
}

export type Action =
  | AutomodStartCommand
  | AutomodStopCommand
  | AutomodEditCommand
  | AutomodSelectCommand
  | AutomodYieldCommand;

type AutomodMessage = Namespaced<Action, 'automod'>;

export interface TalkingStickStartCommand extends AutomodStartCommand {
  playlist: Array<ParticipantId>;
  autoAppendOnJoin: boolean;
  selectionStrategy: AutomodSelectionStrategy.Playlist;
}

export type AutomodStartCommandType = TalkingStickStartCommand;

export const start = createSignalingApiCall<AutomodStartCommandType>('automod', 'start');
export const stop = createSignalingApiCall<AutomodStopCommand>('automod', 'stop');
export const edit = createSignalingApiCall<AutomodEditCommand>('automod', 'edit');
export const select = createSignalingApiCall<SelectCommandType>('automod', 'select');
export const pass = createSignalingApiCall<AutomodYieldCommand>('automod', 'yield');

export const talkingStickStart = {
  action: (payload: { playlist: Array<ParticipantId> }) => {
    return start.action({
      selectionStrategy: AutomodSelectionStrategy.Playlist,
      showList: true,
      considerHandRaise: false,
      allowDoubleSelection: false,
      animationOnRandom: false,
      autoAppendOnJoin: true,
      playlist: payload.playlist,
    });
  },
};

export const selectNext = {
  action: () => {
    return select.action({ how: AutomodSelectHow.Next });
  },
};
export const selectNone = {
  action: () => {
    return select.action({ how: AutomodSelectHow.None });
  },
};
export const selectSpecific = {
  action: (participant: ParticipantId, keepInRemaining: boolean) => {
    return select.action({
      how: AutomodSelectHow.Specific,
      participant,
      keepInRemaining,
    });
  },
};
export const selectRandom = {
  action: () => {
    return select.action({ how: AutomodSelectHow.Random });
  },
};
export interface AutomodApiMessages {
  talkingStickStart: typeof talkingStickStart;
  stop: typeof stop;
  edit: typeof edit;
  pass: typeof pass;
  selectNext: typeof selectNext;
  selectNone: typeof selectNone;
  selectSpecific: typeof selectSpecific;
  selectRandom: typeof selectRandom;
}

export const handler = createModule((builder) => {
  builder.addCase(start.action, (_state, action) => {
    sendMessage(start(action.payload));
  });
  builder.addCase(edit.action, (_state, action) => {
    sendMessage(edit(action.payload));
  });
  builder.addCase(select.action, (_state, action) => {
    sendMessage(select(action.payload));
  });
  builder.addCase(pass.action, (_state, action) => {
    sendMessage(pass(action.payload));
  });
  builder.addCase(stop.action, (_state, action) => {
    sendMessage(stop(action.payload));
  });
});

export default AutomodMessage;
