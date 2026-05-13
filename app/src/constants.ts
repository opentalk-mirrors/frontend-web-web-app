// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2

export const MY_MEETING_MENU_BUTTON_ID = 'my-meeting-menu-button';
export const CHAT_INPUT_ID = 'chat-input';

export enum ToolbarButtonIds {
  Handraise = 'toolbar-handraise',
  Reaction = 'toolbar-reaction',
  ShareScreen = 'toolbar-share-screen',
  Audio = 'toolbar-audio',
  Video = 'toolbar-video',
  More = 'toolbar-more',
  EndCall = 'toolbar-endcall',
}

export const MAX_GRID_TILES_DESKTOP = 24;
export const MAX_GRID_TILES_MOBILE = 9;

export const DISPLAY_NAME_MAX_CHARACTERS = 100;

export const GRID_VIDEO_WIDTHS = [50, 33.33, 25, 25] as readonly number[];
export const GRID_SIZES = [6, 9, 16, 24] as readonly number[];

export const getAvailableGridSizes = (maxGridTiles?: number | string): readonly number[] => {
  const maxTiles = Number(maxGridTiles);
  if (maxGridTiles === undefined || maxGridTiles === '' || Number.isNaN(maxTiles)) {
    return GRID_SIZES;
  }
  const availableSizes = GRID_SIZES.filter((size) => size <= maxTiles);
  return availableSizes.length > 0 ? availableSizes : [GRID_SIZES[0]];
};

export const BREAKOUT_ROOM_CLOSE_DELAY = 60;
export const BREAKOUT_ROOM_DEFAULT_COUNTDOWN_DURATION = 120;
export const TRANSCRIPTION_SEGMENT_HISTORY_LIMIT = 20;
export const TRANSCRIPTION_SEGMENT_EXPIRATION_TIME_MS = 5000;
