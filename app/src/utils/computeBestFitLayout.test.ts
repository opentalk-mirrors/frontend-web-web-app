// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { computeBestFitLayout, computeScrollGridLayout } from './computeBestFitLayout';

describe('computeBestFitLayout()', () => {
  it('returns an empty layout for non-positive inputs', () => {
    expect(computeBestFitLayout({ tileCount: 0, containerWidth: 800, containerHeight: 600, gap: 8 })).toEqual({
      columns: 0,
      rows: 0,
      tileWidth: 0,
      tileHeight: 0,
    });
    expect(computeBestFitLayout({ tileCount: 4, containerWidth: 0, containerHeight: 600, gap: 8 })).toEqual({
      columns: 0,
      rows: 0,
      tileWidth: 0,
      tileHeight: 0,
    });
  });

  it('places a single tile in a 1x1 grid', () => {
    const layout = computeBestFitLayout({ tileCount: 1, containerWidth: 1000, containerHeight: 1000, gap: 0 });
    expect(layout.columns).toBe(1);
    expect(layout.rows).toBe(1);
  });

  it('prefers many columns in a wide container', () => {
    // 16 tiles in a very wide, short container -> a single row.
    const layout = computeBestFitLayout({ tileCount: 16, containerWidth: 4000, containerHeight: 250, gap: 0 });
    expect(layout.columns).toBe(16);
    expect(layout.rows).toBe(1);
  });

  it('prefers a balanced grid when the container aspect matches the tile grid', () => {
    // 16 tiles of 16:9 in a 16:9 container -> 4x4 fills the space exactly.
    const layout = computeBestFitLayout({ tileCount: 16, containerWidth: 1600, containerHeight: 900, gap: 0 });
    expect(layout.columns).toBe(4);
    expect(layout.rows).toBe(4);
  });

  it('matches the ticket example: 16 tiles wide -> 2x8', () => {
    const layout = computeBestFitLayout({ tileCount: 16, containerWidth: 1600, containerHeight: 300, gap: 8 });
    expect(layout.columns).toBe(8);
    expect(layout.rows).toBe(2);
  });

  it('maximizes tile area versus every alternative column count', () => {
    const params = { tileCount: 7, containerWidth: 1280, containerHeight: 720, gap: 8 } as const;
    const best = computeBestFitLayout(params);

    const bestArea = best.tileWidth * best.tileHeight;
    for (let columns = 1; columns <= params.tileCount; columns++) {
      const rows = Math.ceil(params.tileCount / columns);
      const tileWidth = (params.containerWidth - params.gap * (columns - 1)) / columns;
      const tileHeight = tileWidth / (16 / 9);
      const maxTileHeight = (params.containerHeight - params.gap * (rows - 1)) / rows;
      const finalTileHeight = Math.min(tileHeight, maxTileHeight);
      const finalTileWidth = tileHeight > maxTileHeight ? maxTileHeight * (16 / 9) : tileWidth;
      expect(bestArea).toBeGreaterThanOrEqual(finalTileWidth * finalTileHeight - 1e-6);
    }
  });

  it('keeps the requested aspect ratio', () => {
    const layout = computeBestFitLayout({
      tileCount: 4,
      containerWidth: 1000,
      containerHeight: 1000,
      gap: 0,
      aspectRatio: 1,
    });
    expect(layout.tileWidth).toBeCloseTo(layout.tileHeight);
  });
});

describe('computeScrollGridLayout()', () => {
  const base = { gap: 8, minTileWidth: 160, maxColumns: 3 } as const;

  it('returns an empty layout for non-positive inputs', () => {
    expect(computeScrollGridLayout({ ...base, tileCount: 0, containerWidth: 360 })).toEqual({
      columns: 0,
      rows: 0,
      tileWidth: 0,
      tileHeight: 0,
    });
    expect(computeScrollGridLayout({ ...base, tileCount: 9, containerWidth: 0 })).toEqual({
      columns: 0,
      rows: 0,
      tileWidth: 0,
      tileHeight: 0,
    });
  });

  it('shows every tile as rows regardless of height (no clipping on narrow screens)', () => {
    const layout = computeScrollGridLayout({ ...base, tileCount: 24, containerWidth: 360 });
    // 360px -> 2 columns of >=160px, all 24 tiles laid out across 12 rows.
    expect(layout.columns).toBe(2);
    expect(layout.columns * layout.rows).toBeGreaterThanOrEqual(24);
  });

  it('falls back to a single column on very narrow screens', () => {
    const layout = computeScrollGridLayout({ ...base, tileCount: 9, containerWidth: 200 });
    expect(layout.columns).toBe(1);
    expect(layout.rows).toBe(9);
  });

  it('never exceeds maxColumns', () => {
    const layout = computeScrollGridLayout({ ...base, tileCount: 12, containerWidth: 2000 });
    expect(layout.columns).toBe(3);
  });

  it('never uses more columns than tiles', () => {
    const layout = computeScrollGridLayout({ ...base, tileCount: 1, containerWidth: 2000 });
    expect(layout.columns).toBe(1);
  });

  it('keeps the 16:9 aspect ratio', () => {
    const layout = computeScrollGridLayout({ ...base, tileCount: 6, containerWidth: 360 });
    expect(layout.tileWidth / layout.tileHeight).toBeCloseTo(16 / 9);
  });
});
