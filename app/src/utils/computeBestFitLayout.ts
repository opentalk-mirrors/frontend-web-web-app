// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2

export interface BestFitLayoutParams {
  tileCount: number;
  containerWidth: number;
  containerHeight: number;
  gap: number;
  // Defaults to 16:9
  aspectRatio?: number;
}

export interface ScrollGridLayoutParams {
  tileCount: number;
  containerWidth: number;
  gap: number;
  minTileWidth: number;
  maxColumns: number;
  // Defaults to 16:9
  aspectRatio?: number;
}

export interface BestFitLayout {
  columns: number;
  rows: number;
  tileWidth: number;
  tileHeight: number;
}

const DEFAULT_ASPECT_RATIO = 16 / 9;

const EMPTY_LAYOUT: BestFitLayout = { columns: 0, rows: 0, tileWidth: 0, tileHeight: 0 };

/**
 * Evaluates every column count from 1..tileCount and returns the row/column
 * configuration that yields the largest possible tiles for the given container,
 * keeping a fixed aspect ratio. Requires a bounded container height.
 */
export function computeBestFitLayout({
  tileCount,
  containerWidth,
  containerHeight,
  gap,
  aspectRatio = DEFAULT_ASPECT_RATIO,
}: BestFitLayoutParams): BestFitLayout {
  if (tileCount <= 0 || containerWidth <= 0 || containerHeight <= 0) {
    return EMPTY_LAYOUT;
  }

  let best = EMPTY_LAYOUT;
  let bestArea = -1;

  for (let columns = 1; columns <= tileCount; columns++) {
    const rows = Math.ceil(tileCount / columns);

    const availableWidth = containerWidth - gap * (columns - 1);
    const availableHeight = containerHeight - gap * (rows - 1);
    if (availableWidth <= 0 || availableHeight <= 0) {
      continue;
    }

    // Start from the width-constrained tile, then apply a height constraint so
    // that the entire grid fits vertically while preserving the aspect ratio
    let tileWidth = availableWidth / columns;
    let tileHeight = tileWidth / aspectRatio;

    const maxTileHeight = availableHeight / rows;
    if (tileHeight > maxTileHeight) {
      tileHeight = maxTileHeight;
      tileWidth = tileHeight * aspectRatio;
    }

    const area = tileWidth * tileHeight;
    if (area > bestArea) {
      bestArea = area;
      best = { columns, rows, tileWidth, tileHeight };
    }
  }

  return best;
}

/**
 * Width-only layout for scrolling containers (e.g. mobile) where the height is
 * unbounded/scrollable. Picks the column count from the available width and lets the rows
 * grow vertically so no tile is clipped.
 */
export function computeScrollGridLayout({
  tileCount,
  containerWidth,
  gap,
  minTileWidth,
  maxColumns,
  aspectRatio = DEFAULT_ASPECT_RATIO,
}: ScrollGridLayoutParams): BestFitLayout {
  if (tileCount <= 0 || containerWidth <= 0) {
    return EMPTY_LAYOUT;
  }

  const fittingColumns = Math.floor((containerWidth + gap) / (minTileWidth + gap));
  const columns = Math.max(1, Math.min(maxColumns, tileCount, fittingColumns));
  const rows = Math.ceil(tileCount / columns);

  const tileWidth = (containerWidth - gap * (columns - 1)) / columns;
  const tileHeight = tileWidth / aspectRatio;

  return { columns, rows, tileWidth, tileHeight };
}
