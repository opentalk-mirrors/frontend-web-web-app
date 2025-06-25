// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
// We only need this implementation for Firefox. For other browsers, we use LiveKit's virtual background and blur.
// Once LiveKit supports Firefox, we will drop this implementation.
import type { ProcessorOptions, Track, TrackProcessor } from 'livekit-client';

import log from '../../logger';

export type SourcePlayback = {
  htmlElement: HTMLImageElement | HTMLVideoElement;
  width: number;
  height: number;
};

// For more information on TFlite and WASM refer to:
// https://github.com/Volcomix/virtual-background#building-tflite-to-webassembly
export interface TFLite extends EmscriptenModule {
  _getModelBufferMemoryOffset(): number;
  _getInputMemoryOffset(): number;
  _getInputHeight(): number;
  _getInputWidth(): number;
  _getInputChannelCount(): number;
  _getOutputMemoryOffset(): number;
  _getOutputHeight(): number;
  _getOutputWidth(): number;
  _getOutputChannelCount(): number;
  _loadModel(bufferSize: number): number;
  _runInference(): number;
}

declare function createTFLiteModule(): Promise<TFLite>;
declare function createTFLiteSIMDModule(): Promise<TFLite>;

const SEGMENTATION_HEIGHT = 144;
const SEGMENTATION_WIDTH = 256;
const REFRESH_RATE = 25;

// Confidence range is [0, 1]
// Current values have been determined during testing
// https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1162#note_79329
const MIN_CONFIDENCE = 0.3;
const MAX_CONFIDENCE = 0.8;
const BLEND_COEFF = 1 / (MAX_CONFIDENCE - MIN_CONFIDENCE);
const BLUR_STRENGTH = 7;

export interface BackgroundConfig {
  style: 'blur' | 'color' | 'image' | 'off';
  color?: string;
  imageUrl?: string;
}

export class BackgroundBlur implements TrackProcessor<Track.Kind.Video> {
  name: string;
  processedTrack?: MediaStreamTrack;

  private interval?: NodeJS.Timeout;
  private static tfLiteCache?: Promise<TFLite>;
  private outputMemoryOffset: number = 0;
  private inputMemoryOffset: number = 0;
  private segmentationMask = new ImageData(SEGMENTATION_WIDTH, SEGMENTATION_HEIGHT);
  private segmentationMaskCanvas = document.createElement('canvas');
  private segmentationMaskCtx: CanvasRenderingContext2D | null = null;
  private canvas: HTMLCanvasElement;
  private drawingContext: CanvasRenderingContext2D;
  private sourcePlayback?: SourcePlayback;
  private videoElement?: HTMLVideoElement;
  private config: BackgroundConfig;
  private imageBackdrop?: HTMLImageElement;
  private static _tfLite: TFLite;

  /**
   * Creates a TFLiteSIMDModule or if this is not supported a TFLiteModule. Fetches the
   * model file and loads it into to the TFLite file.
   *
   * @returns {Promise} Promise object represents a TFLite object
   */
  private static async loadTFLiteModel(): Promise<TFLite> {
    let tfLite: TFLite;

    try {
      tfLite = await createTFLiteSIMDModule();
    } catch (error) {
      log.warn('Failed to create TFLite SIMD WebAssembly module.', error);
      tfLite = await createTFLiteModule();
    }

    // For model card refer to:
    // https://storage.googleapis.com/mediapipe-assets/Model%20Card%20MediaPipe%20Selfie%20Segmentation.pdf
    const modelResponse = await fetch('/models/selfie_segmenter_landscape.tflite');
    const model = await modelResponse.arrayBuffer();

    const modelBufferOffset = tfLite._getModelBufferMemoryOffset();
    tfLite.HEAPU8.set(new Uint8Array(model), modelBufferOffset);

    log.debug('_loadModel result:', tfLite._loadModel(model.byteLength));
    return tfLite;
  }

  private static setupVideoElement(
    videoTrack: MediaStreamTrack,
    width: number,
    height: number,
    element?: HTMLVideoElement
  ): HTMLVideoElement {
    const videoElement: HTMLVideoElement = element || document.createElement('video');
    videoElement.autoplay = true;
    videoElement.width = width;
    videoElement.height = height;
    videoElement.srcObject = new MediaStream([videoTrack]);

    return videoElement;
  }

  constructor(opt: BackgroundConfig) {
    this.config = opt || { style: 'blur' };
    this.canvas = document.createElement('canvas');
    this.drawingContext = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.name = `background_${this.config.imageUrl ? this.config.imageUrl : this.config.style}`;
  }

  static async initTFLite() {
    if (!BackgroundBlur.tfLiteCache) {
      BackgroundBlur.tfLiteCache = BackgroundBlur.loadTFLiteModel();
      BackgroundBlur.tfLiteCache.catch(() => {
        BackgroundBlur.tfLiteCache = undefined;
      });
    }
    BackgroundBlur.tfLite = await BackgroundBlur.tfLiteCache;
  }

  static get tfLite(): TFLite {
    return this._tfLite;
  }

  static set tfLite(tfLite: TFLite) {
    this._tfLite = tfLite;
  }

  async setup() {
    await BackgroundBlur.initTFLite();
    this.outputMemoryOffset = BackgroundBlur.tfLite && BackgroundBlur.tfLite?._getOutputMemoryOffset() / 4;
    this.inputMemoryOffset = BackgroundBlur.tfLite && BackgroundBlur.tfLite?._getInputMemoryOffset() / 4;
    this.segmentationMaskCanvas.width = this.segmentationMask.width;
    this.segmentationMaskCanvas.height = this.segmentationMask.height;
    this.segmentationMaskCtx = this.segmentationMaskCanvas.getContext('2d', { willReadFrequently: true });

    // fire fix -> https://bugzilla.mozilla.org/show_bug.cgi?id=1572422
    if (this.config.style === 'image') {
      if (this.config.imageUrl === undefined) {
        throw new Error('expected a URL for the background image');
      }
      if (this.imageBackdrop === undefined) {
        this.imageBackdrop = new Image();
      }
      this.imageBackdrop.src = this.config.imageUrl;
    }
  }

  /**
   * Stop the blurring effect, clear the video element and reset the drawingContext.
   */
  public stop() {
    this.stopRendering();
    this.videoElement = undefined;
    this.drawingContext?.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  public async destroy() {
    this.stop();
  }

  public async init(opts: ProcessorOptions<Track.Kind.Video>): Promise<void> {
    await this.setup();
    this.start(opts);
  }

  public async restart(opts: ProcessorOptions<Track.Kind.Video>) {
    await this.destroy();
    return this.init(opts);
  }

  public start({ track, element }: ProcessorOptions<Track.Kind.Video>) {
    this.stop();

    if (this.config.style === 'off') {
      return undefined;
    }

    if (track.kind !== 'video') {
      throw new Error(`Got ${track.kind} track instead of a video track`);
    }

    if (track.readyState === 'ended') {
      log.warn(`Got ended track on start`);
      return undefined;
    }

    const settings = track.getSettings();
    const width = settings.width;
    const height = settings.height;
    if (width === undefined || isNaN(width) || height === undefined || isNaN(height)) {
      throw new Error(`Video processing failed due to unknown input size: (width: ${width}, height: ${height})`);
    }

    track.addEventListener('ended', () => {
      this.stopRendering();
    });

    this.videoElement = BackgroundBlur.setupVideoElement(
      track,
      width,
      height,
      element instanceof HTMLVideoElement ? element : undefined
    );

    this.videoElement.onloadeddata = (ev: Event) => {
      const video = ev.target as HTMLVideoElement;
      this.sourcePlayback = {
        htmlElement: this.videoElement as HTMLVideoElement,
        width: video.width,
        height: video.height,
      };
      this.startRendering();
    };

    this.processedTrack = this.canvas.captureStream(25).getVideoTracks()[0];
  }

  private render() {
    if (!this.sourcePlayback || !this.sourcePlayback.htmlElement) {
      log.warn('sourcePlayback is broken');
      this.stopRendering();
      const ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
      ctx.filter = 'none';
      ctx.fillStyle = this.config.color || 'black';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      return;
    }

    this.canvas.width = this.sourcePlayback.width;
    this.canvas.height = this.sourcePlayback.height;

    if (!BackgroundBlur.tfLite) {
      throw Error('tfLite model is broken');
    }

    if (!this.segmentationMaskCtx) {
      throw Error('tfLite model is segmentationMaskCtx');
    }

    this.segmentationMaskCtx.drawImage(
      this.sourcePlayback.htmlElement,
      0,
      0,
      this.sourcePlayback.width,
      this.sourcePlayback.height,
      0,
      0,
      this.segmentationMask.width,
      this.segmentationMask.height
    );

    const imageData = this.segmentationMaskCtx.getImageData(
      0,
      0,
      this.segmentationMask.width,
      this.segmentationMask.height
    );

    for (let i = 0; i < imageData.data.length / 4; i++) {
      const data = imageData.data[i * 4];
      BackgroundBlur.tfLite.HEAPF32[this.inputMemoryOffset + i * 3] = data / 255;
      BackgroundBlur.tfLite.HEAPF32[this.inputMemoryOffset + i * 3 + 1] = data / 255;
      BackgroundBlur.tfLite.HEAPF32[this.inputMemoryOffset + i * 3 + 2] = data / 255;
    }

    BackgroundBlur.tfLite._runInference();
    for (let i = 0; i < this.segmentationMask.data.length / 4; i++) {
      const confidence = BackgroundBlur.tfLite.HEAPF32[this.outputMemoryOffset + i] || 0;
      // Aplha blending in the edge area to smooth the mask corners
      // Original formula "edgeAlpha = (confidence - minConfidence) / (maxConfidence - minConfidence)"
      const edgeAlpha = (confidence - MIN_CONFIDENCE) * BLEND_COEFF;
      const alpha = Math.min(Math.max(edgeAlpha, 0), 1);
      this.segmentationMask.data[i * 4 + 3] = 255 * alpha; // set mask alpha value
    }
    this.segmentationMaskCtx.putImageData(this.segmentationMask, 0, 0);

    const ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;

    ctx.globalCompositeOperation = 'copy';

    // drawSegmentationMask
    ctx.drawImage(
      this.segmentationMaskCanvas,
      0,
      0,
      this.segmentationMask.width,
      this.segmentationMask.height,
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );

    ctx.globalCompositeOperation = 'source-in';
    ctx.filter = 'none';

    const htmlElement = this.sourcePlayback.htmlElement;
    ctx.drawImage(htmlElement, 0, 0);

    // blurBackground
    ctx.globalCompositeOperation = 'destination-over';

    switch (this.config.style) {
      case 'blur':
        ctx.filter = `blur(${BLUR_STRENGTH}px)`; // FIXME Does not work on Safari
        ctx.drawImage(htmlElement, 0, 0);
        break;
      case 'color':
        ctx.filter = 'none';
        ctx.fillStyle = this.config.color || 'black';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        break;
      case 'image':
        if (this.imageBackdrop === undefined) {
          throw new Error('background image is missing');
        }
        {
          const backDropScaling = this.canvas.height / this.imageBackdrop.height;

          ctx.filter = 'none';
          ctx.drawImage(this.imageBackdrop, 0, 0, backDropScaling * this.imageBackdrop.width, this.canvas.height);
          break;
        }
    }
  }

  private stopRendering() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }

  private startRendering() {
    this.interval = setInterval(async () => {
      try {
        this.render();
      } catch (error) {
        log.error('BgBlur render error:', error);
        this.stopRendering();
      }
    }, 1000 / REFRESH_RATE);
  }

  private runPostProcessing() {}
}
