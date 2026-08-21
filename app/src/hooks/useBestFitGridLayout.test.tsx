// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { act, render, screen } from '@testing-library/react';

import { computeBestFitLayout, computeScrollGridLayout } from '../utils/computeBestFitLayout';
import { useBestFitGridLayout } from './useBestFitGridLayout';

const Harness = ({ tileCount = 12, allowScroll = false }: { tileCount?: number; allowScroll?: boolean }) => {
  const { containerRef, layout, isScrolling } = useBestFitGridLayout(tileCount, { gap: 8, allowScroll });
  return (
    <div
      ref={containerRef}
      data-testid="grid"
      data-layout={JSON.stringify(layout)}
      data-scrolling={String(isScrolling)}
    />
  );
};

describe('useBestFitGridLayout', () => {
  let notify: ResizeObserverCallback;
  let nextFrame: number;
  let frames: Map<number, FrameRequestCallback>;
  const disconnect = vi.fn();

  const resize = (width: number, height: number) => {
    notify(
      [
        {
          target: screen.getByTestId('grid'),
          contentRect: new DOMRectReadOnly(0, 0, width, height),
          borderBoxSize: [],
          contentBoxSize: [],
          devicePixelContentBoxSize: [],
        },
      ],
      {} as ResizeObserver
    );
  };
  const flushFrame = () => {
    const callbacks = [...frames.values()];
    frames.clear();
    act(() => {
      for (const callback of callbacks) {
        callback(0);
      }
    });
  };
  const readLayout = () => JSON.parse(screen.getByTestId('grid').getAttribute('data-layout') || '{}');
  const readScrolling = () => screen.getByTestId('grid').getAttribute('data-scrolling') === 'true';

  beforeEach(() => {
    nextFrame = 0;
    frames = new Map();
    disconnect.mockClear();
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(1000);
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(600);
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: ResizeObserverCallback) {
          notify = callback;
        }
        observe() {}
        unobserve() {}
        disconnect = disconnect;
      }
    );
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.set(++nextFrame, callback);
      return nextFrame;
    });
    vi.stubGlobal('cancelAnimationFrame', (handle: number) => frames.delete(handle));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('measures the content box on mount without waiting for an observer notification', () => {
    render(<Harness />);
    expect(readLayout()).toEqual(
      computeBestFitLayout({ tileCount: 12, containerWidth: 1000, containerHeight: 600, gap: 8 })
    );
  });

  it('ignores the border box so a scrollbar cannot skew the first frame', () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ width: 1015, height: 600 } as DOMRect);
    render(<Harness />);
    expect(readLayout()).toEqual(
      computeBestFitLayout({ tileCount: 12, containerWidth: 1000, containerHeight: 600, gap: 8 })
    );
  });

  it('coalesces rapid notifications and uses the latest fractional size', () => {
    render(<Harness />);
    const initial = readLayout();
    act(() => {
      resize(800, 600);
      resize(700, 600);
      resize(600.25, 600.5);
    });
    expect(frames.size).toBe(1);
    expect(readLayout()).toEqual(initial);
    flushFrame();
    expect(readLayout()).toEqual(
      computeBestFitLayout({ tileCount: 12, containerWidth: 600.25, containerHeight: 600.5, gap: 8 })
    );
  });

  it('recomputes when tile count or layout mode changes', () => {
    const { rerender } = render(<Harness />);
    rerender(<Harness tileCount={24} allowScroll />);
    expect(readLayout()).toEqual(
      computeBestFitLayout({ tileCount: 24, containerWidth: 1000, containerHeight: 600, gap: 8 })
    );
    rerender(<Harness tileCount={1} />);
    expect(readLayout()).toMatchObject({ columns: 1, rows: 1 });
  });

  describe('when scrolling is allowed', () => {
    const setViewport = (width: number, height: number) => {
      vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(width);
      vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(height);
    };

    it('fits 9 tiles into a portrait viewport without scrolling', () => {
      setViewport(373, 655);
      render(<Harness tileCount={9} allowScroll />);

      const layout = readLayout();
      expect(layout).toMatchObject({ columns: 2, rows: 5 });
      expect(layout.rows * layout.tileHeight + 8 * (layout.rows - 1)).toBeLessThanOrEqual(655);
      expect(readScrolling()).toBe(false);
    });

    it('fits a short landscape viewport without scrolling', () => {
      setViewport(800, 300);
      render(<Harness tileCount={9} allowScroll />);

      const layout = readLayout();
      expect(layout.rows * layout.tileHeight + 8 * (layout.rows - 1)).toBeLessThanOrEqual(300);
      expect(readScrolling()).toBe(false);
    });

    it('falls back to scrolling when fitted tiles would be too small', () => {
      setViewport(320, 360);
      render(<Harness tileCount={9} allowScroll />);

      expect(readScrolling()).toBe(true);
      expect(readLayout()).toEqual(
        computeScrollGridLayout({ tileCount: 9, containerWidth: 320, gap: 8, minTileWidth: 160, maxColumns: 3 })
      );
    });

    it('never scrolls when scrolling is not allowed', () => {
      setViewport(320, 360);
      render(<Harness tileCount={9} />);

      expect(readScrolling()).toBe(false);
      expect(readLayout()).toEqual(
        computeBestFitLayout({ tileCount: 9, containerWidth: 320, containerHeight: 360, gap: 8 })
      );
    });
  });

  it('disconnects and cancels pending work on unmount', () => {
    const { unmount } = render(<Harness />);
    act(() => resize(700, 600));
    unmount();
    expect(disconnect).toHaveBeenCalledOnce();
    expect(frames.size).toBe(0);
  });
});
