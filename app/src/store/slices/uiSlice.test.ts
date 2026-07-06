// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import LayoutOptions from '../../enums/LayoutOptions';
import { CinemaViewSortOrder } from './common';
import reducer, {
  loadCinemaLayoutSettingsFromLocalStorage,
  loadGridSizeFromSessionStorage,
  persistCinemaLayoutSettings,
  resolveMeetingGridSize,
  storeGridSizeToSessionStorage,
  updatedCinemaLayout,
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
