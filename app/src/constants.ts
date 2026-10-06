// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2

export const MY_MEETING_MENU_BUTTON_ID = 'my-meeting-menu-button';
export const CHAT_INPUT_ID = 'chat-input';
export const SIDE_PANEL_ID = 'side-panel';
export const SIDE_PANEL_TITLE_ID = 'side-panel-title';
export const SIDE_PANEL_WIDTH_PX = 332;
export const SIDE_PANEL_OFFSET_VARIABLE = '--side-panel-offset';

export enum ToolbarButtonIds {
  Handraise = 'toolbar-handraise',
  Reaction = 'toolbar-reaction',
  ShareScreen = 'toolbar-share-screen',
  Audio = 'toolbar-audio',
  Video = 'toolbar-video',
  More = 'toolbar-more',
  EndCall = 'toolbar-endcall',
  Participants = 'toolbar-participants',
  Chat = 'toolbar-chat',
  Messages = 'toolbar-messages',
  Moderator = 'toolbar-moderator',
}

export const DISPLAY_NAME_MAX_CHARACTERS = 100;

export const MAX_GRID_TILES_DESKTOP = 24;
export const MAX_GRID_TILES_MOBILE = 9;
export const MIN_TILE_WIDTH_PX = 160;
export const MAX_SCROLL_GRID_COLUMNS = 3;

export const GRID_SIZES = [6, 9, 16, 24] as readonly number[];

export const BREAKOUT_ROOM_CLOSE_DELAY = 60;
export const BREAKOUT_ROOM_DEFAULT_COUNTDOWN_DURATION = 120;
export const TRANSCRIPTION_SEGMENT_HISTORY_LIMIT = 20;
export const TRANSCRIPTION_SEGMENT_EXPIRATION_TIME_MS = 5000;
