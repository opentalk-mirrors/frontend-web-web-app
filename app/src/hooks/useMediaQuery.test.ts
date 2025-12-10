// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useMediaQuery, useTheme } from '@mui/material';
import { renderHook, waitFor } from '@testing-library/react';
import { Mock } from 'vitest';

import { useAppSelector } from './useCustomRedux';
import { useIsDesktop, useIsMobile, useIsMobileForFullscreenElements } from './useMediaQuery';

vi.mock('@mui/material', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('@mui/material');

  return {
    ...actual,
    useMediaQuery: vi.fn(),
    useTheme: vi.fn(),
  };
});

vi.mock('./useCustomRedux', () => ({
  useAppSelector: vi.fn(),
}));

describe('useMediaQuery', () => {
  const mockUseMediaQuery = useMediaQuery as Mock;
  const mockUseTheme = useTheme as Mock;
  const mockUseAppSelector = useAppSelector as unknown as Mock;

  const setupThemeBreakpoints = () => {
    const down = vi.fn((value: string) => `down-${value}`);
    const up = vi.fn((value: string) => `up-${value}`);

    mockUseTheme.mockReturnValue({ breakpoints: { down, up } });

    return { down, up };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the media query result for mobile screens', () => {
    const { down } = setupThemeBreakpoints();
    mockUseMediaQuery.mockReturnValue(true);

    const { result: isMobileResult } = renderHook(() => useIsMobile());

    expect(down).toHaveBeenCalledWith('md');
    expect(mockUseMediaQuery).toHaveBeenCalledWith('down-md');
    expect(isMobileResult.current).toBe(true);
  });

  it('returns the media query result for desktop screens', () => {
    const { up } = setupThemeBreakpoints();
    mockUseMediaQuery.mockReturnValue(false);

    const { result: isDesktopResult } = renderHook(() => useIsDesktop());

    expect(up).toHaveBeenCalledWith('md');
    expect(mockUseMediaQuery).toHaveBeenCalledWith('up-md');
    expect(isDesktopResult.current).toBe(false);
  });

  it('freezes the mobile state while fullscreen is active and updates afterwards', async () => {
    setupThemeBreakpoints();
    let isMobile = true;
    let isFullscreenActive = false;

    mockUseMediaQuery.mockImplementation(() => isMobile);
    mockUseAppSelector.mockImplementation(() => isFullscreenActive);

    const { result: isMobileForFullscreenElementsResult, rerender } = renderHook(() =>
      useIsMobileForFullscreenElements()
    );

    expect(isMobileForFullscreenElementsResult.current).toBe(true);

    isMobile = false;
    isFullscreenActive = true;
    rerender();

    expect(isMobileForFullscreenElementsResult.current).toBe(true);

    isFullscreenActive = false;
    rerender();

    await waitFor(() => {
      expect(isMobileForFullscreenElementsResult.current).toBe(false);
    });
  });
});
