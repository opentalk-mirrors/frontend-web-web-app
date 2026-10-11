// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Track } from 'livekit-client';

import { AutomodStartedEvent } from '../../api/types/incoming/automod';
import { MenuTab } from '../../components/MenuTabs/fragments/constants';
import { MODERATION_MENU_VIEW, ModerationTabKey } from '../../config/constants';
import { GRID_SIZES, MAX_GRID_TILES_DESKTOP, MAX_GRID_TILES_MOBILE } from '../../constants';
import LayoutOptions from '../../enums/LayoutOptions';
import { ChatScope, ConnectionIdentifier, ParticipantId, SortOption } from '../../types';
import type { RootState } from '../index';
import { started as automodStarted } from './automodSlice';
import { SwitchedRoomPayload, switchedRoom } from './breakoutSlice';
import { CinemaViewSortOrder } from './common';
import { connectionClosed } from './roomSlice';
import reducer, {
  closeSidePanel,
  loadCinemaLayoutSettingsFromLocalStorage,
  loadGridSizeFromSessionStorage,
  openSidePanel,
  persistCinemaLayoutSettings,
  resolveMeetingGridSize,
  selectEffectiveGridPageSize,
  storeGridSizeToSessionStorage,
  toggleModerationPanel,
  toggleSidePanel,
  updatedCinemaLayout,
  type UIState,
} from './uiSlice';

const getInitialState = () => reducer(undefined, { type: '@@INIT' });

describe('uiSlice updatedCinemaLayout', () => {
  it('updates the current cinema layout', () => {
    const state = reducer(getInitialState(), updatedCinemaLayout({ layout: LayoutOptions.Speaker }));

    expect(state.cinemaLayout).toBe(LayoutOptions.Speaker);
  });

  it('caches non-overlay layouts as the last layout when cacheLastLayout is set', () => {
    const state = reducer(
      getInitialState(),
      updatedCinemaLayout({ layout: LayoutOptions.Speaker, cacheLastLayout: true })
    );

    expect(state.lastCinemaLayout).toBe(LayoutOptions.Speaker);
  });

  it('does not change the last layout when cacheLastLayout is omitted', () => {
    const initialState = { ...getInitialState(), lastCinemaLayout: LayoutOptions.Speaker };

    const state = reducer(initialState, updatedCinemaLayout({ layout: LayoutOptions.Grid }));

    expect(state.lastCinemaLayout).toBe(LayoutOptions.Speaker);
  });

  it('never caches MeetingNotes as the last layout, even with cacheLastLayout set', () => {
    const initialState = { ...getInitialState(), lastCinemaLayout: LayoutOptions.Speaker };

    const state = reducer(
      initialState,
      updatedCinemaLayout({ layout: LayoutOptions.MeetingNotes, cacheLastLayout: true })
    );

    expect(state.cinemaLayout).toBe(LayoutOptions.MeetingNotes);
    expect(state.lastCinemaLayout).toBe(LayoutOptions.Speaker);
  });

  it('never caches Whiteboard as the last layout, even with cacheLastLayout set', () => {
    const initialState = { ...getInitialState(), lastCinemaLayout: LayoutOptions.Grid };

    const state = reducer(
      initialState,
      updatedCinemaLayout({ layout: LayoutOptions.Whiteboard, cacheLastLayout: true })
    );

    expect(state.cinemaLayout).toBe(LayoutOptions.Whiteboard);
    expect(state.lastCinemaLayout).toBe(LayoutOptions.Grid);
  });

  it('allows hiding meeting notes by returning to the cached last layout', () => {
    let state = reducer(
      getInitialState(),
      updatedCinemaLayout({ layout: LayoutOptions.Speaker, cacheLastLayout: true })
    );
    state = reducer(state, updatedCinemaLayout({ layout: LayoutOptions.MeetingNotes, cacheLastLayout: true }));

    state = reducer(state, updatedCinemaLayout({ layout: state.lastCinemaLayout }));

    expect(state.cinemaLayout).toBe(LayoutOptions.Speaker);
  });
});

describe('uiSlice switchedRoom', () => {
  it('closes the whiteboard and returns to the cached last layout when switching rooms', () => {
    let state = reducer(
      getInitialState(),
      updatedCinemaLayout({ layout: LayoutOptions.Speaker, cacheLastLayout: true })
    );
    state = reducer(state, updatedCinemaLayout({ layout: LayoutOptions.Whiteboard, cacheLastLayout: true }));

    state = reducer(state, switchedRoom({ newRoom: { id: 'room-1' } } as unknown as SwitchedRoomPayload));

    expect(state.cinemaLayout).toBe(LayoutOptions.Speaker);
  });

  it('leaves a non-whiteboard layout untouched when switching rooms', () => {
    const state = reducer(
      { ...getInitialState(), cinemaLayout: LayoutOptions.Grid },
      switchedRoom({ newRoom: { id: 'room-1' } } as unknown as SwitchedRoomPayload)
    );

    expect(state.cinemaLayout).toBe(LayoutOptions.Grid);
  });
});

describe('uiSlice side panel', () => {
  it('opens with the chat view by default', () => {
    expect(getInitialState().sidePanelView).toBe(MenuTab.Chat);
  });

  it('opens the requested view', () => {
    const state = reducer(getInitialState(), openSidePanel(MODERATION_MENU_VIEW));

    expect(state.sidePanelView).toBe(MODERATION_MENU_VIEW);
  });

  it('closes the panel', () => {
    const state = reducer(getInitialState(), closeSidePanel());

    expect(state.sidePanelView).toBeNull();
  });

  it('closes the panel when toggling the view that is already displayed', () => {
    const state = reducer({ ...getInitialState(), sidePanelView: MenuTab.People }, toggleSidePanel(MenuTab.People));

    expect(state.sidePanelView).toBeNull();
  });

  it('switches the view when toggling a different view', () => {
    const state = reducer({ ...getInitialState(), sidePanelView: MenuTab.People }, toggleSidePanel(MenuTab.Messages));

    expect(state.sidePanelView).toBe(MenuTab.Messages);
  });

  it('reopens the panel when toggling while closed', () => {
    const state = reducer({ ...getInitialState(), sidePanelView: null }, toggleSidePanel(ModerationTabKey.MuteUsers));

    expect(state.sidePanelView).toBe(ModerationTabKey.MuteUsers);
  });

  it('shows the people view when the talking stick starts', () => {
    const state = reducer(
      { ...getInitialState(), sidePanelView: null },
      automodStarted({} as unknown as AutomodStartedEvent)
    );

    expect(state.sidePanelView).toBe(MenuTab.People);
  });
});

describe('uiSlice moderation panel', () => {
  it('opens the moderation overview from a closed panel', () => {
    const state = reducer({ ...getInitialState(), sidePanelView: null }, toggleModerationPanel());

    expect(state.sidePanelView).toBe(MODERATION_MENU_VIEW);
  });

  it('closes the panel while a moderation tool is displayed', () => {
    let state = reducer(getInitialState(), toggleModerationPanel());
    state = reducer(state, openSidePanel(ModerationTabKey.Polls));

    state = reducer(state, toggleModerationPanel());

    expect(state.sidePanelView).toBeNull();
  });

  it('reopens the moderation tool that was displayed last', () => {
    let state = reducer(getInitialState(), toggleModerationPanel());
    state = reducer(state, openSidePanel(ModerationTabKey.Polls));
    state = reducer(state, toggleModerationPanel());

    state = reducer(state, toggleModerationPanel());

    expect(state.sidePanelView).toBe(ModerationTabKey.Polls);
  });

  it('returns to the overview once the moderator navigates back', () => {
    let state = reducer(getInitialState(), openSidePanel(ModerationTabKey.Polls));
    state = reducer(state, openSidePanel(MODERATION_MENU_VIEW));
    state = reducer(state, toggleModerationPanel());

    state = reducer(state, toggleModerationPanel());

    expect(state.sidePanelView).toBe(MODERATION_MENU_VIEW);
  });

  it('does not remember the top level views', () => {
    let state = reducer(getInitialState(), openSidePanel(ModerationTabKey.Polls));
    state = reducer(state, openSidePanel(MenuTab.Chat));

    state = reducer(state, toggleModerationPanel());

    expect(state.sidePanelView).toBe(ModerationTabKey.Polls);
  });
});

describe('loadCinemaLayoutSettingsFromLocalStorage', () => {
  const STORAGE_KEY = 'cinemaLayoutSettings';
  const originalMaxGridTiles = window.config.maxGridTiles;

  afterEach(() => {
    localStorage.clear();
    window.config.maxGridTiles = originalMaxGridTiles;
  });

  it('returns undefined when nothing is stored', () => {
    expect(loadCinemaLayoutSettingsFromLocalStorage()).toBeUndefined();
  });

  it('returns the stored settings unchanged when no maxGridTiles is configured', () => {
    window.config.maxGridTiles = undefined;
    const stored = { cinemaLayout: LayoutOptions.Grid, cinemaGridSize: 24 };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

    expect(loadCinemaLayoutSettingsFromLocalStorage()).toEqual(stored);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual(stored);
  });

  it('keeps the stored grid size when it does not exceed maxGridTiles', () => {
    window.config.maxGridTiles = 16;
    const stored = { cinemaLayout: LayoutOptions.Grid, cinemaGridSize: 9 };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

    expect(loadCinemaLayoutSettingsFromLocalStorage()).toEqual(stored);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual(stored);
  });

  it('drops the stored grid size and persists the cleaned entry when it exceeds maxGridTiles', () => {
    window.config.maxGridTiles = 9;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ cinemaLayout: LayoutOptions.Grid, cinemaGridSize: 24 }));

    expect(loadCinemaLayoutSettingsFromLocalStorage()).toEqual({ cinemaLayout: LayoutOptions.Grid });
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({ cinemaLayout: LayoutOptions.Grid });
  });
});

describe('per-meeting default grid size', () => {
  const STORAGE_KEY = 'cinemaLayoutSettings';
  const originalDefaultGridSize = window.config.defaultGridSize;
  const originalMaxGridTiles = window.config.maxGridTiles;

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    window.config.defaultGridSize = originalDefaultGridSize;
    window.config.maxGridTiles = originalMaxGridTiles;
  });

  describe('sessionStorage grid size helpers', () => {
    it('returns undefined when no grid size is stored for the meeting', () => {
      expect(loadGridSizeFromSessionStorage('room-a')).toBeUndefined();
    });

    it('stores and loads the grid size per meeting', () => {
      storeGridSizeToSessionStorage('room-a', 24);

      expect(loadGridSizeFromSessionStorage('room-a')).toBe(24);
      expect(loadGridSizeFromSessionStorage('room-b')).toBeUndefined();
    });
  });

  describe('resolveMeetingGridSize', () => {
    it('uses the configured default when the meeting has no stored grid size', () => {
      expect(resolveMeetingGridSize(9, 'room-a')).toBe(9);
    });

    it('uses the configured default when no room id is available', () => {
      expect(resolveMeetingGridSize(9, undefined)).toBe(9);
    });

    it('prefers the grid size previously selected for the same meeting', () => {
      storeGridSizeToSessionStorage('room-a', 24);

      expect(resolveMeetingGridSize(9, 'room-a')).toBe(24);
    });

    it('falls back to the default for a different meeting', () => {
      storeGridSizeToSessionStorage('room-a', 24);

      expect(resolveMeetingGridSize(9, 'room-b')).toBe(9);
    });

    it('ignores an invalid stored grid size and uses the default', () => {
      storeGridSizeToSessionStorage('room-a', 7);

      expect(resolveMeetingGridSize(9, 'room-a')).toBe(9);
    });

    it('ignores a stored grid size that exceeds maxGridTiles and uses the default', () => {
      window.config.maxGridTiles = 9;
      storeGridSizeToSessionStorage('room-a', 24);

      expect(resolveMeetingGridSize(9, 'room-a')).toBe(9);
    });

    it('keeps a stored grid size that is within maxGridTiles', () => {
      window.config.maxGridTiles = 16;
      storeGridSizeToSessionStorage('room-a', 16);

      expect(resolveMeetingGridSize(9, 'room-a')).toBe(16);
    });

    it('reproduces the described end-to-end behaviour', () => {
      const defaultGridSize = 9;

      // user joins meeting A -> default grid size
      expect(resolveMeetingGridSize(defaultGridSize, 'room-a')).toBe(defaultGridSize);

      // user sets it to 24 (persisted per meeting), then reloads the tab and rejoins A -> 24
      storeGridSizeToSessionStorage('room-a', 24);
      expect(resolveMeetingGridSize(defaultGridSize, 'room-a')).toBe(24);

      // user joins another meeting B -> default grid size again
      expect(resolveMeetingGridSize(defaultGridSize, 'room-b')).toBe(defaultGridSize);
    });
  });

  describe('persistCinemaLayoutSettings', () => {
    it('persists the grid size into the localStorage bundle when no default is configured', () => {
      persistCinemaLayoutSettings({
        cinemaLayout: LayoutOptions.Grid,
        cinemaViewOrder: CinemaViewSortOrder.ActivityFirst,
        cinemaGridSize: 24,
        defaultGridSize: undefined,
        roomId: 'room-a',
      });

      expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({
        cinemaLayout: LayoutOptions.Grid,
        cinemaViewOrder: CinemaViewSortOrder.ActivityFirst,
        cinemaGridSize: 24,
      });
      expect(loadGridSizeFromSessionStorage('room-a')).toBeUndefined();
    });

    it('persists the grid size to sessionStorage per meeting when a default is configured', () => {
      persistCinemaLayoutSettings({
        cinemaLayout: LayoutOptions.Grid,
        cinemaViewOrder: CinemaViewSortOrder.ActivityFirst,
        cinemaGridSize: 24,
        defaultGridSize: 9,
        roomId: 'room-a',
      });

      // grid size is not written to the shared localStorage bundle
      expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({
        cinemaLayout: LayoutOptions.Grid,
        cinemaViewOrder: CinemaViewSortOrder.ActivityFirst,
      });
      // grid size is stored per meeting instead
      expect(loadGridSizeFromSessionStorage('room-a')).toBe(24);
    });
  });

  describe('loadCinemaLayoutSettingsFromLocalStorage', () => {
    it('ignores a grid size stored in the localStorage bundle when a default is configured', () => {
      window.config.defaultGridSize = 9;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ cinemaLayout: LayoutOptions.Grid, cinemaGridSize: 24 }));

      expect(loadCinemaLayoutSettingsFromLocalStorage()).toEqual({ cinemaLayout: LayoutOptions.Grid });
    });
  });
});

describe('connection closed', () => {
  it('resets self view state', () => {
    const initialState: UIState = { ...getInitialState(), isSelfViewMinimized: true };
    const state = reducer(initialState, connectionClosed({ errorCode: 1006 }));
    expect(state.isSelfViewMinimized).toBe(false);
  });

  it('resets chat conversation state', () => {
    const initialState: UIState = {
      ...getInitialState(),
      chatConversationState: { scope: ChatScope.Private, target: 'participant-1' as ParticipantId },
    };
    const state = reducer(initialState, connectionClosed({ errorCode: 1006 }));
    expect(state.chatConversationState).toEqual({ scope: ChatScope.Global });
  });

  it('resets cinema layout', () => {
    const initialState: UIState = { ...getInitialState(), cinemaLayout: LayoutOptions.Speaker };
    const state = reducer(initialState, connectionClosed({ errorCode: 1006 }));
    expect(state.cinemaLayout).toBe(LayoutOptions.Grid);
  });

  it('resets cinema view order', () => {
    const initialState: UIState = { ...getInitialState(), cinemaViewOrder: CinemaViewSortOrder.VideoFirst };
    const state = reducer(initialState, connectionClosed({ errorCode: 1006 }));
    expect(state.cinemaViewOrder).toBe(CinemaViewSortOrder.ActivityFirst);
  });

  it('resets participants sort option', () => {
    const initialState: UIState = { ...getInitialState(), participantsSortOption: SortOption.LastActive };
    const state = reducer(initialState, connectionClosed({ errorCode: 1006 }));
    expect(state.participantsSortOption).toBe(SortOption.NameASC);
  });

  it('resets pinned tile', () => {
    const initialState: UIState = {
      ...getInitialState(),
      pinnedTile: {
        connectionIdentifier: 'participant-1:connection-1' as ConnectionIdentifier,
        source: Track.Source.Camera,
      },
    };
    const state = reducer(initialState, connectionClosed({ errorCode: 1006 }));
    expect(state.pinnedTile).toBeUndefined();
  });

  it('resets pagination page', () => {
    const initialState: UIState = { ...getInitialState(), paginationPage: 3 };
    const state = reducer(initialState, connectionClosed({ errorCode: 1006 }));
    expect(state.paginationPage).toBe(1);
  });

  it('resets participants search value', () => {
    const initialState: UIState = { ...getInitialState(), participantsSearchValue: 'alice' };
    const state = reducer(initialState, connectionClosed({ errorCode: 1006 }));
    expect(state.participantsSearchValue).toBe('');
  });
});

describe('selectEffectiveGridPageSize', () => {
  const createState = (cinemaGridSize: number) => ({ ui: { cinemaGridSize } }) as unknown as RootState;

  it.each(GRID_SIZES)('returns the selected size %i on desktop', (cinemaGridSize) => {
    expect(selectEffectiveGridPageSize(createState(cinemaGridSize))).toBe(cinemaGridSize);
  });

  it.each(GRID_SIZES)('caps the selected size %i on mobile', (cinemaGridSize) => {
    expect(selectEffectiveGridPageSize(createState(cinemaGridSize), true)).toBe(
      Math.min(cinemaGridSize, MAX_GRID_TILES_MOBILE)
    );
  });

  it('caps sizes above the desktop maximum', () => {
    expect(selectEffectiveGridPageSize(createState(MAX_GRID_TILES_DESKTOP + 1))).toBe(MAX_GRID_TILES_DESKTOP);
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    'falls back to the breakpoint maximum for the invalid size %s',
    (cinemaGridSize) => {
      expect(selectEffectiveGridPageSize(createState(cinemaGridSize))).toBe(MAX_GRID_TILES_DESKTOP);
      expect(selectEffectiveGridPageSize(createState(cinemaGridSize), true)).toBe(MAX_GRID_TILES_MOBILE);
    }
  );
});
