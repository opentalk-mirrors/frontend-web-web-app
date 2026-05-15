// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { act } from '@testing-library/react';
import { createAudioAnalyser } from 'livekit-client';
import type { LocalAudioTrack } from 'livekit-client';
import type { Mock } from 'vitest';

import { createOpenTalkTheme } from '../../../assets/themes/opentalk';
import { defaultDarkModeColors, defaultLightModeColors } from '../../../assets/themes/opentalk/palette';
import BrowserSupport from '../../../modules/BrowserSupport';
import { renderWithProviders } from '../../../utils/testUtils';
import AudioIndicator from './AudioIndicator';

vi.mock('livekit-client', () => ({
  createAudioAnalyser: vi.fn(),
  LocalAudioTrack: class {},
}));

vi.mock('../../../modules/BrowserSupport', () => ({
  __esModule: true,
  default: { isSafari: vi.fn() },
}));

const createAudioAnalyserMock = createAudioAnalyser as Mock;
const isSafariMock = BrowserSupport.isSafari as Mock;

const palette = { light: defaultLightModeColors, dark: defaultDarkModeColors };
const theme = createOpenTalkTheme('dark', palette);

const createMockContext = (dimensions = { width: 120, height: 80 }) => {
  let fillStyle = '';
  let strokeStyle = '';
  const widthAssignments: number[] = [];

  const canvas = {
    _width: dimensions.width,
    _height: dimensions.height,
    get width() {
      return this._width;
    },
    set width(value: number) {
      this._width = value;
      widthAssignments.push(value);
    },
    get height() {
      return this._height;
    },
    set height(value: number) {
      this._height = value;
    },
  };

  const ctx = {
    canvas,
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    set fillStyle(value: string) {
      fillStyle = value;
    },
    get fillStyle() {
      return fillStyle;
    },
    set strokeStyle(value: string) {
      strokeStyle = value;
    },
    get strokeStyle() {
      return strokeStyle;
    },
    lineWidth: 0,
  };

  return {
    ctx: ctx as unknown as CanvasRenderingContext2D,
    getFillStyle: () => fillStyle,
    getStrokeStyle: () => strokeStyle,
    widthAssignments,
  };
};

describe('<AudioIndicator />', () => {
  const mockTrack = {} as LocalAudioTrack;
  let rafId = 0;
  const requestAnimationFrameMock = vi.fn();
  const cancelAnimationFrameMock = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    rafId = 0;
    requestAnimationFrameMock.mockReset();
    requestAnimationFrameMock.mockImplementation((cb: FrameRequestCallback) => {
      rafId += 1;
      setTimeout(() => cb(performance.now()), 16);
      return rafId;
    });
    cancelAnimationFrameMock.mockReset();
    vi.stubGlobal('requestAnimationFrame', requestAnimationFrameMock);
    vi.stubGlobal('cancelAnimationFrame', cancelAnimationFrameMock);
    isSafariMock.mockReturnValue(false);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    createAudioAnalyserMock.mockReset();
    isSafariMock.mockReset();
  });

  it('draws a bar indicator based on analyser data', () => {
    const { ctx, getFillStyle, getStrokeStyle } = createMockContext();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx);

    const getByteFrequencyData = vi.fn((array: Uint8Array) => array.set([100, 50]));
    const cleanup = vi.fn();

    createAudioAnalyserMock.mockReturnValue({
      cleanup,
      analyser: {
        frequencyBinCount: 2,
        getByteFrequencyData,
      },
    });

    renderWithProviders(<AudioIndicator shape="bar" localAudioTrack={mockTrack} />, { provider: { mui: true } });

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(getByteFrequencyData).toHaveBeenCalled();
    expect(createAudioAnalyserMock).toHaveBeenCalledWith(mockTrack);
    expect(ctx.fillRect).toHaveBeenCalled();
    expect(ctx.arc).not.toHaveBeenCalled();
    expect(getFillStyle()).toBe(theme.palette.secondary.main);
    expect(getStrokeStyle()).toBe(theme.palette.background.customPaper.primary);
  });

  it('uses circular drawing when shape is circle', () => {
    const { ctx } = createMockContext();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx);

    const getByteFrequencyData = vi.fn((array: Uint8Array) => array.set([200]));
    createAudioAnalyserMock.mockReturnValue({
      cleanup: vi.fn(),
      analyser: {
        frequencyBinCount: 1,
        getByteFrequencyData,
      },
    });

    renderWithProviders(<AudioIndicator shape="circle" localAudioTrack={mockTrack} />, { provider: { mui: true } });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(ctx.arc).toHaveBeenCalled();
    expect(ctx.fillRect).not.toHaveBeenCalled();
  });

  it('resets canvas width to clear Safari canvases', () => {
    isSafariMock.mockReturnValue(true);
    const { ctx, widthAssignments } = createMockContext();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx);

    createAudioAnalyserMock.mockReturnValue({
      cleanup: vi.fn(),
      analyser: {
        frequencyBinCount: 1,
        getByteFrequencyData: vi.fn(),
      },
    });

    renderWithProviders(<AudioIndicator shape="bar" localAudioTrack={mockTrack} />, { provider: { mui: true } });

    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(widthAssignments.length).toBeGreaterThan(0);
    expect(widthAssignments[0]).toBe(ctx.canvas.width);
  });

  it('cleans up analyser and animation frame on unmount', () => {
    const { ctx } = createMockContext();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx);

    const cleanup = vi.fn();
    createAudioAnalyserMock.mockReturnValue({
      cleanup,
      analyser: {
        frequencyBinCount: 1,
        getByteFrequencyData: vi.fn(),
      },
    });

    const view = renderWithProviders(<AudioIndicator shape="bar" localAudioTrack={mockTrack} />, {
      provider: { mui: true },
    });

    view.unmount();

    expect(cleanup).toHaveBeenCalled();
    expect(cancelAnimationFrameMock).toHaveBeenCalled();
  });
});
