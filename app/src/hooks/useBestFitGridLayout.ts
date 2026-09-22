// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useLayoutEffect, useMemo, useRef, useState } from 'react';

import { MAX_SCROLL_GRID_COLUMNS, MIN_TILE_WIDTH_PX } from '../constants';
import { BestFitLayout, computeBestFitLayout, computeScrollGridLayout } from '../utils/computeBestFitLayout';

interface ContainerSize {
  width: number;
  height: number;
}

export interface BestFitGridLayoutOptions {
  gap: number;
  aspectRatio?: number;
  // Permits scrolling when a fitted layout would shrink tiles below minTileWidth
  allowScroll?: boolean;
  minTileWidth?: number;
  // Only used by the scrolling fallback
  maxColumns?: number;
}

export function useBestFitGridLayout(tileCount: number, options: BestFitGridLayoutOptions) {
  const {
    gap,
    aspectRatio,
    allowScroll = false,
    minTileWidth = MIN_TILE_WIDTH_PX,
    maxColumns = MAX_SCROLL_GRID_COLUMNS,
  } = options;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<ContainerSize>({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    let frame: number | undefined;
    const updateSize = ({ width, height }: ContainerSize) => {
      setSize((previous) => (previous.width === width && previous.height === height ? previous : { width, height }));
    };

    const observer = new ResizeObserver((entries) => {
      const entry = entries.find(({ target }) => target === container);
      if (!entry) {
        return;
      }
      if (frame !== undefined) {
        cancelAnimationFrame(frame);
      }
      frame = requestAnimationFrame(() => {
        frame = undefined;
        updateSize(entry.contentRect);
      });
    });
    observer.observe(container);
    updateSize({ width: container.clientWidth, height: container.clientHeight });

    return () => {
      observer.disconnect();
      if (frame !== undefined) {
        cancelAnimationFrame(frame);
      }
    };
  }, []);

  // Every dependency recomputes only on a real resize instead of on every parent render and keeps the returned
  // layout referentially stable for consumer dependencies
  const { layout, isScrolling } = useMemo<{ layout: BestFitLayout; isScrolling: boolean }>(() => {
    const fitted = computeBestFitLayout({
      tileCount,
      containerWidth: size.width,
      containerHeight: size.height,
      gap,
      aspectRatio,
    });

    if (!allowScroll || fitted.tileWidth >= minTileWidth) {
      return { layout: fitted, isScrolling: false };
    }

    return {
      layout: computeScrollGridLayout({
        tileCount,
        containerWidth: size.width,
        gap,
        minTileWidth,
        maxColumns,
        aspectRatio,
      }),
      isScrolling: true,
    };
  }, [tileCount, size.width, size.height, gap, aspectRatio, allowScroll, minTileWidth, maxColumns]);

  return { containerRef, layout, isScrolling };
}
