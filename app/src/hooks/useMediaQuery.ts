// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';

import { selectFullscreenActive } from '../store/slices/fullscreen/slice';
import { useAppSelector } from './useCustomRedux';

export function useIsMobile() {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down('md'));
}

export function useIsDesktop() {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.up('md'));
}

// This hooke freezes the media query state before entering fullscreen mode.
// It should be used instead of `useIsMobile` by components that contain elements,
// which supposed to be fullscreened.
export function useIsMobileForFullscreenElements() {
  const isCurrentlyMobile = useIsMobile();
  const isFullscreenActive = useAppSelector(selectFullscreenActive);
  const [stableIsMobile, setStableIsMobile] = useState(isCurrentlyMobile);

  useEffect(() => {
    if (!isFullscreenActive) {
      setStableIsMobile(isCurrentlyMobile);
    }
  }, [isCurrentlyMobile, isFullscreenActive]);

  return stableIsMobile;
}
