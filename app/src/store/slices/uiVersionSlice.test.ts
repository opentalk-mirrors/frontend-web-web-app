// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { localStorageItems } from '../../config/storage';
import { ConferenceUiVersion } from '../../config/uiVersion';
import reducer, {
  initialState,
  loadUiVersionFromLocalStorage,
  saveUiVersionToLocalStorage,
  setPreferredConferenceUiVersion,
} from './uiVersionSlice';

describe('uiVersionSlice', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('defaults to v1', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual({ preferredVersion: ConferenceUiVersion.V1 });
  });

  it('stores the preferred version without side effects', () => {
    const state = reducer(initialState, setPreferredConferenceUiVersion(ConferenceUiVersion.V2));

    expect(state.preferredVersion).toBe(ConferenceUiVersion.V2);
    // persistence is handled by a listener, so the reducer must not touch localStorage
    expect(localStorage.getItem(localStorageItems.conferenceUiVersion)).toBeNull();
  });

  it('persists the preferred version to local storage', () => {
    saveUiVersionToLocalStorage(ConferenceUiVersion.V2);

    expect(localStorage.getItem(localStorageItems.conferenceUiVersion)).toBe(ConferenceUiVersion.V2);
  });

  it('rehydrates a valid persisted preference', () => {
    localStorage.setItem(localStorageItems.conferenceUiVersion, ConferenceUiVersion.V2);

    expect(loadUiVersionFromLocalStorage()).toEqual({ preferredVersion: ConferenceUiVersion.V2 });
  });

  it('ignores an invalid or missing persisted preference', () => {
    expect(loadUiVersionFromLocalStorage()).toBeUndefined();

    localStorage.setItem(localStorageItems.conferenceUiVersion, 'v3');
    expect(loadUiVersionFromLocalStorage()).toBeUndefined();
  });
});
