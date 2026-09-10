// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { act } from '@testing-library/react';

import { ConferenceUiVersion } from '../config/uiVersion';
import { setPreferredConferenceUiVersion } from '../store/slices/uiVersionSlice';
import { configureStore, renderHookWithProviders } from '../utils/testUtils';
import useConferenceUiVersion from './useConferenceUiVersion';

const renderUseConferenceUiVersion = ({
  available,
  preferred,
}: {
  available?: boolean;
  preferred?: ConferenceUiVersion;
} = {}) => {
  const { store } = configureStore({
    initialState: {
      config: { features: { conferenceUiV2: available } },
      uiVersion: { preferredVersion: preferred ?? ConferenceUiVersion.V1 },
    },
  });

  return { store, ...renderHookWithProviders(() => useConferenceUiVersion(), { store }) };
};

describe('useConferenceUiVersion', () => {
  it('resolves to v1 by default', () => {
    const { result } = renderUseConferenceUiVersion();

    expect(result.current.version).toBe(ConferenceUiVersion.V1);
    expect(result.current.isV2).toBe(false);
  });

  it('stays v1 when the user opted in but v2 is not available', () => {
    const { result } = renderUseConferenceUiVersion({ available: false, preferred: ConferenceUiVersion.V2 });

    expect(result.current.isV2).toBe(false);
    expect(result.current.isV2Available).toBe(false);
  });

  it('stays v1 when v2 is available but the user did not opt in', () => {
    const { result } = renderUseConferenceUiVersion({ available: true, preferred: ConferenceUiVersion.V1 });

    expect(result.current.isV2).toBe(false);
    expect(result.current.isV2Available).toBe(true);
  });

  it('resolves to v2 only when available and opted in', () => {
    const { result } = renderUseConferenceUiVersion({ available: true, preferred: ConferenceUiVersion.V2 });

    expect(result.current.version).toBe(ConferenceUiVersion.V2);
    expect(result.current.isV2).toBe(true);
  });

  it('reacts to a preference change', () => {
    const { result, store } = renderUseConferenceUiVersion({ available: true, preferred: ConferenceUiVersion.V1 });

    expect(result.current.isV2).toBe(false);

    act(() => {
      store.dispatch(setPreferredConferenceUiVersion(ConferenceUiVersion.V2));
    });

    expect(result.current.isV2).toBe(true);
  });
});
