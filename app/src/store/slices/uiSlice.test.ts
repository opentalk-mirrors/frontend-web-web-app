// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import LayoutOptions from '../../enums/LayoutOptions';
import reducer, { loadCinemaLayoutSettingsFromLocalStorage, updatedCinemaLayout } from './uiSlice';

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
