// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
// V2-CLEANUP: entire file is part of the v1/v2 transition - delete when v2 is the default
import { useCallback } from 'react';

import { ConferenceUiVersion } from '../config/uiVersion';
import { selectIsConferenceUiV2Available } from '../store/slices/configSlice';
import { selectPreferredConferenceUiVersion, setPreferredConferenceUiVersion } from '../store/slices/uiVersionSlice';
import { useAppDispatch, useAppSelector } from './useCustomRedux';

const useConferenceUiVersion = () => {
  const dispatch = useAppDispatch();
  const isV2Available = useAppSelector(selectIsConferenceUiV2Available);
  const preferredVersion = useAppSelector(selectPreferredConferenceUiVersion);

  const version =
    isV2Available && preferredVersion === ConferenceUiVersion.V2 ? ConferenceUiVersion.V2 : ConferenceUiVersion.V1;

  const setPreferredVersion = useCallback(
    (next: ConferenceUiVersion) => dispatch(setPreferredConferenceUiVersion(next)),
    [dispatch]
  );

  return {
    version,
    isV2: version === ConferenceUiVersion.V2,
    isV2Available,
    preferredVersion,
    setPreferredVersion,
  };
};

export default useConferenceUiVersion;
