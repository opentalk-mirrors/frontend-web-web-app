// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2

// We only need this implementation for Firefox. For other browsers, we use LiveKit's virtual background and blur.
// Once LiveKit supports Firefox, we will drop this implementation.

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

export class BackgroundBlur {
  private interval?: NodeJS.Timeout;
  private tfLite: TFLite;
  private readonly outputMemoryOffset: number = 0;
  private readonly inputMemoryOffset: number = 0;
  private segmentationMask = new ImageData(SEGMENTATION_WIDTH, SEGMENTATION_WIDTH);
  private segmentationPixelCount = SEGMENTATION_WIDTH * SEGMENTATION_HEIGHT;
  private segmentationMaskCanvas = document.createElement('canvas');
  private segmentationMaskCtx;
  private canvas: HTMLCanvasElement;
  private drawingContext: CanvasRenderingContext2D;
  private sourcePlayback?: SourcePlayback;
  private videoElement?: HTMLVideoElement;
  private config: BackgroundConfig;
  private imageBackdrop?: HTMLImageElement;

  /**
   * Create and returns an instance of BackgroundBlur
   *
   * @returns {Promise} Promise object represents instance of BackgroundBlur
   */
  public static async create(): Promise<BackgroundBlur> {
    const tfLite = await this.loadTFLiteModel();
    return new BackgroundBlur(tfLite);
  }

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
      console.warn('Failed to create TFLite SIMD WebAssembly module.', error);
      tfLite = await createTFLiteModule();
    }

    // For model card refer to:
    // https://storage.googleapis.com/mediapipe-assets/Model%20Card%20MediaPipe%20Selfie%20Segmentation.pdf
    const modelResponse = await fetch(`/models/selfie_segmentation_landscape_05185647.tflite`);
    const model = await modelResponse.arrayBuffer();

    const modelBufferOffset = tfLite._getModelBufferMemoryOffset();
    tfLite.HEAPU8.set(new Uint8Array(model), modelBufferOffset);

    console.debug('_loadModel result:', tfLite._loadModel(model.byteLength));

    return tfLite;
  }

  /**
   * Creates a video element with the given video track and returns the HTMLVideoElement
   *
   * @param {MediaStreamTrack} videoTrack
   * @param {number} width
   * @param {number} height
   * @returns {HTMLVideoElement}
   */
  private static createVideoElement(videoTrack: MediaStreamTrack, width: number, height: number): HTMLVideoElement {
    const videoElement: HTMLVideoElement = document.createElement('video');
    videoElement.autoplay = true;
    videoElement.width = width;
    videoElement.height = height;
    videoElement.srcObject = new MediaStream([videoTrack]);

    return videoElement;
  }

  private constructor(tfLite: TFLite) {
    this.tfLite = tfLite;
    this.outputMemoryOffset = tfLite._getOutputMemoryOffset() / 4;
    this.inputMemoryOffset = tfLite._getInputMemoryOffset() / 4;
    this.segmentationMaskCanvas.width = SEGMENTATION_WIDTH;
    this.segmentationMaskCanvas.height = SEGMENTATION_HEIGHT;
    this.segmentationMaskCtx = this.segmentationMaskCanvas.getContext('2d');
    this.canvas = document.createElement('canvas');
    // fire fix -> https://bugzilla.mozilla.org/show_bug.cgi?id=1572422
    this.drawingContext = this.canvas.getContext('2d') as CanvasRenderingContext2D;

    this.config = {
      style: 'blur',
    };
  }

  /**
   * Indicates if the blurring is enabled.
   *
   * @returns {boolean}
   */
  public isEnabled() {
    return this.interval !== undefined;
  }

  /**
   * Stop the blurring effect, clear the video element and reset the drawingContext.
   */
  public stop() {
    this.stopRendering();
    this.videoElement = undefined;
    this.drawingContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Start the blurringEffect and replace the given video track with the blurred video track.
   * Before it starts, it will try to stop any other running blurred effects.
   *
   * @param videoTrack
   * @param config to control the kind of background replacement
   * @returns {Promise} Promise object represents a MediaStreamTrack object
   */
  public async start(videoTrack: MediaStreamTrack, config: BackgroundConfig): Promise<MediaStreamTrack> {
    this.stop();
    if (videoTrack.kind !== 'video') {
      throw new Error(`Got ${videoTrack.kind} track instead of a video track`);
    }

    const width = videoTrack.getSettings().width;
    const height = videoTrack.getSettings().height;
    if (width === undefined || isNaN(width) || height === undefined || isNaN(height)) {
      throw new Error(`Video processing failed due to unknown input size: (width: ${width}, height: ${height})`);
    }

    videoTrack.addEventListener('ended', () => {
      this.stopRendering();
    });

    this.config = config;

    if (config.style === 'image') {
      if (config.imageUrl === undefined) {
        throw new Error('expected a URL for the background image');
      }
      if (this.imageBackdrop === undefined) {
        this.imageBackdrop = new Image();
      }
      this.imageBackdrop.src = config.imageUrl;
    }

    this.videoElement = BackgroundBlur.createVideoElement(videoTrack, width, height);

    this.videoElement.onloadeddata = (ev: Event) => {
      const video = ev.target as HTMLVideoElement;
      this.sourcePlayback = {
        htmlElement: this.videoElement as HTMLVideoElement,
        width: video.width,
        height: video.height,
      };
      this.startRendering();
    };

    return this.canvas.captureStream(25).getVideoTracks()[0];
  }

  private async render() {
    this.resizeSource();
    await this.runInference();
    this.runPostProcessing();
  }

  private stopRendering() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }

  private async runInference() {
    this.tfLite._runInference();
    for (let i = 0; i < this.segmentationPixelCount; i++) {
      const confidence = this.tfLite.HEAPF32[this.outputMemoryOffset + i];
      // Aplha blending in the edge area to smooth the mask corners
      // Original formula "edgeAlpha = (confidence - minConfidence) / (maxConfidence - minConfidence)"
      const edgeAlpha = (confidence - MIN_CONFIDENCE) * BLEND_COEFF;
      const alpha = Math.min(Math.max(edgeAlpha, 0), 1);
      this.segmentationMask.data[i * 4 + 3] = 255 * alpha; // set mask alpha value
    }
    this.segmentationMaskCtx?.putImageData(this.segmentationMask, 0, 0);
  }

  private startRendering() {
    this.interval = setInterval(async () => {
      try {
        await this.render();
      } catch (error) {
        console.error('BgBlur render error:', error);
        this.stopRendering();
      }
    }, 1000 / REFRESH_RATE);
  }

  private resizeSource() {
    if (!this.sourcePlayback) {
      return;
    }
    this.segmentationMaskCtx?.drawImage(
      this.sourcePlayback.htmlElement,
      0,
      0,
      this.sourcePlayback?.width,
      this.sourcePlayback?.height,
      0,
      0,
      SEGMENTATION_WIDTH,
      SEGMENTATION_HEIGHT
    );

    const imageData = this.segmentationMaskCtx?.getImageData(0, 0, SEGMENTATION_WIDTH, SEGMENTATION_HEIGHT);

    for (let i = 0; i < this.segmentationPixelCount; i++) {
      const data = imageData ? imageData.data[i * 4] : 0;
      this.tfLite.HEAPF32[this.inputMemoryOffset + i * 3] = data / 255;
      this.tfLite.HEAPF32[this.inputMemoryOffset + i * 3 + 1] = data / 255;
      this.tfLite.HEAPF32[this.inputMemoryOffset + i * 3 + 2] = data / 255;
    }
  }

  private runPostProcessing() {
    this.canvas.width = this.sourcePlayback?.width as number;
    this.canvas.height = this.sourcePlayback?.height as number;
    const ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.globalCompositeOperation = 'copy';

    // drawSegmentationMask
    ctx.drawImage(
      this.segmentationMaskCanvas,
      0,
      0,
      SEGMENTATION_WIDTH,
      SEGMENTATION_HEIGHT,
      0,
      0,
      this.sourcePlayback?.width as number,
      this.sourcePlayback?.height as number
    );

    ctx.globalCompositeOperation = 'source-in';
    ctx.filter = 'none';

    ctx.drawImage(this.sourcePlayback?.htmlElement as CanvasImageSource, 0, 0);

    // blurBackground
    ctx.globalCompositeOperation = 'destination-over';

    switch (this.config.style) {
      case 'blur':
        ctx.filter = `blur(${BLUR_STRENGTH}px)`; // FIXME Does not work on Safari
        ctx.drawImage(this.sourcePlayback?.htmlElement as CanvasImageSource, 0, 0);
        break;
      case 'color':
        ctx.filter = 'none';
        ctx.fillStyle = this.config.color || 'black';
        ctx.fillRect(0, 0, this.sourcePlayback?.width as number, this.sourcePlayback?.height as number);
        break;
      case 'image':
        if (this.imageBackdrop === undefined) {
          throw new Error('background image is missing');
        }
        {
          const backDropScaling = (this.sourcePlayback?.height as number) / this.imageBackdrop.height;

          ctx.filter = 'none';
          ctx.drawImage(
            this.imageBackdrop,
            0,
            0,
            backDropScaling * this.imageBackdrop.width,
            this.sourcePlayback?.height as number
          );
          break;
        }
    }
  }
}
