// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2

export const GRID_GAP = 8;

export const GRID_GAP_VAR = '--grid-gap';
export const GRID_COLUMNS_VAR = '--grid-columns';
export const GRID_TILE_WIDTH_VAR = '--grid-tile-width';

const WRAP_SAFETY_PX = 1;

const columns = `var(${GRID_COLUMNS_VAR}, 1)`;

/**
 * Cap at the height-safe pixel width, but never exceed the live per-column width, so tiles
 * shrink with the container instead of wrapping when the measured size lags behind a resize.
 * The trailing 1px avoids sub-pixel rounding pushing the last tile onto a new row.
 */
export const GRID_CELL_WIDTH = `min(var(${GRID_TILE_WIDTH_VAR}, 100%), calc((100% - (${columns} - 1) * var(${GRID_GAP_VAR}, ${GRID_GAP}px) - ${WRAP_SAFETY_PX}px) / ${columns}))`;
