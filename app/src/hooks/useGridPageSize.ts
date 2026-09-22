// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { selectEffectiveGridPageSize } from '../store/slices/uiSlice';
import { useAppSelector } from './useCustomRedux';
import { useIsMobile } from './useMediaQuery';

/**
 * Number of tiles shown per grid page, clamped to the breakpoint specific maximum.
 * Single source of truth for both the tiles the grid renders and the page count.
 */
export function useGridPageSize() {
  const isMobile = useIsMobile();
  return useAppSelector((state) => selectEffectiveGridPageSize(state, isMobile));
}
