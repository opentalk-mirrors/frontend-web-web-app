import * as vision from '@mediapipe/tasks-vision';
import { dependencies } from '../../package.json';
import { isChromiumBasedBrowser } from '../utils';
import VideoTransformer from './VideoTransformer';
import { VideoTransformerInitOptions } from './types';

export type SegmenterOptions = Partial<vision.ImageSegmenterOptions['baseOptions']>;

export type BackgroundOptions = {
  blurRadius?: number;
  imagePath?: string;
  /** cannot be updated through the `update` method, needs a restart */
  segmenterOptions?: SegmenterOptions;
  /** cannot be updated through the `update` method, needs a restart */
  assetPaths?: { tasksVisionFileSet?: string; modelAssetPath?: string };
};

export default class BackgroundProcessor extends VideoTransformer<BackgroundOptions> {
  static get isSupported() {
    return typeof OffscreenCanvas !== 'undefined';
  }

  imageSegmenter?: vision.ImageSegmenter;

  segmentationResults: vision.ImageSegmenterResult | undefined;

  backgroundImage: ImageBitmap | null = null;

  blurRadius?: number;

  options: BackgroundOptions;

  constructor(opts: BackgroundOptions) {
    super();
    this.options = opts;
    this.update(opts);
  }

  getVideoRectangle(canvas: OffscreenCanvas, frame: VideoFrame) {
    const scaleWidth = canvas.width / frame.displayWidth;
    const scaleHeight = canvas.height / frame.displayHeight;
    const scaleFactor = Math.min(scaleWidth, scaleHeight);

    const width = frame.displayWidth * scaleFactor;
    const height = frame.displayHeight * scaleFactor;

    const { x, y } = this.centerRectangle(canvas.width, canvas.height, width, height);

    return { width, height, x, y };
  }

  centerRectangle(
    outerWidth: number,
    outerHeight: number,
    innerWidth: number,
    innerHeight: number,
  ) {
    return {
      x: (outerWidth - innerWidth) / 2,
      y: (outerHeight - innerHeight) / 2,
    };
  }

  async init({ outputCanvas, inputElement: inputVideo }: VideoTransformerInitOptions) {
    await super.init({ outputCanvas, inputElement: inputVideo });

    const fileSet = await vision.FilesetResolver.forVisionTasks(
      this.options.assetPaths?.tasksVisionFileSet ??
        `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${dependencies['@mediapipe/tasks-vision']}/wasm`,
    );

    this.imageSegmenter = await vision.ImageSegmenter.createFromOptions(fileSet, {
      baseOptions: {
        modelAssetPath:
          this.options.assetPaths?.modelAssetPath ??
          'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite',
        delegate: isChromiumBasedBrowser ? 'GPU' : 'CPU', // make GPU exepction - CPU default
        ...this.options.segmenterOptions,
      },
      runningMode: 'VIDEO',
      outputCategoryMask: false,
      outputConfidenceMasks: true,
    });

    // Skip loading the image here if update already loaded the image below
    if (this.options?.imagePath && !this.backgroundImage) {
      await this.loadBackground(this.options.imagePath).catch((err) =>
        console.error('Error while loading processor background image: ', err),
      );
    }
  }

  async destroy() {
    await super.destroy();
    await this.imageSegmenter?.close();
    this.backgroundImage = null;
  }

  async loadBackground(path: string) {
    const img = new Image();

    await new Promise((resolve, reject) => {
      img.crossOrigin = 'Anonymous';
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
      img.src = path;
    });
    const imageData = await createImageBitmap(img);
    this.backgroundImage = imageData;
  }

  async transform(frame: VideoFrame, controller: TransformStreamDefaultController<VideoFrame>) {
    try {
      if (this.isDisabled) {
        controller.enqueue(frame);
        return;
      }
      if (!this.canvas) {
        throw TypeError('Canvas needs to be initialized first');
      }
      const startTimeMs = performance.now();
      this.imageSegmenter?.segmentForVideo(
        this.inputVideo!,
        startTimeMs,
        (result: vision.ImageSegmenterResult | undefined) => (this.segmentationResults = result),
      );

      if (this.blurRadius) {
        await this.blurBackground(frame);
      } else {
        await this.drawVirtualBackground(frame);
      }
      const newFrame = new VideoFrame(this.canvas, {
        timestamp: frame.timestamp || Date.now(),
      });
      controller.enqueue(newFrame);
    } finally {
      frame.close();
    }
  }

  async update(opts: BackgroundOptions) {
    this.options = opts;
    if (opts.blurRadius) {
      this.blurRadius = opts.blurRadius;
    } else if (opts.imagePath) {
      await this.loadBackground(opts.imagePath);
    }
  }

  async drawVirtualBackground(frame: VideoFrame) {
    if (!this.canvas || !this.ctx || !this.segmentationResults || !this.inputVideo) return;
    this.ctx.save();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const frameRectangle = this.getVideoRectangle(this.canvas, frame);

    if (this.segmentationResults?.confidenceMasks) {
      this.ctx.filter = 'none';
      this.ctx.globalCompositeOperation = 'source-out';

      const alphabitmap = await alphaCorrection(
        this.segmentationResults.confidenceMasks,
        this.canvas,
      );
      this.ctx?.drawImage(
        alphabitmap,
        frameRectangle.x,
        frameRectangle.y,
        frameRectangle.width,
        frameRectangle.height,
      );

      if (this.backgroundImage) {
        this.ctx.drawImage(
          this.backgroundImage,
          frameRectangle.x,
          frameRectangle.y,
          frameRectangle.width,
          frameRectangle.height,
          frameRectangle.x,
          frameRectangle.y,
          frameRectangle.width,
          frameRectangle.height,
        );
      } else {
        this.ctx.fillStyle = '#00FF00';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      }

      this.ctx.globalCompositeOperation = 'destination-over';
    }
    this.ctx.drawImage(
      frame,
      frameRectangle.x,
      frameRectangle.y,
      frameRectangle.width,
      frameRectangle.height,
    );
    this.ctx.restore();
  }

  async blurBackground(frame: VideoFrame) {
    if (
      !this.ctx ||
      !this.canvas ||
      !this.segmentationResults?.confidenceMasks ||
      !this.inputVideo
    ) {
      return;
    }

    this.ctx.save();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.segmentationResults?.confidenceMasks) {
      this.ctx.filter = 'none';
      this.ctx.globalCompositeOperation = 'source-out';

      const alphabitmap = await alphaCorrection(
        this.segmentationResults.confidenceMasks,
        this.canvas,
      );
      this.ctx?.drawImage(alphabitmap, 0, 0, this.canvas.width, this.canvas.height);
      this.ctx.globalCompositeOperation = 'source-in';
      this.ctx.drawImage(frame, 0, 0, this.canvas.width, this.canvas.height);
      this.ctx.globalCompositeOperation = 'destination-over';
      this.ctx.filter = `blur(${this.blurRadius}px)`;
      this.ctx.drawImage(frame, 0, 0, this.canvas.width, this.canvas.height);
      this.ctx.restore();
    }
  }
}

function alphaCorrection(
  confidenceMasks: vision.MPMask[],
  canvas: OffscreenCanvas,
): Promise<ImageBitmap> {
  const result = confidenceMasks[0].getAsUint8Array();
  const videoHeight = confidenceMasks[0].height || canvas.height;
  const videoWidth = confidenceMasks[0].width || canvas.width;
  const dataArray: Uint8ClampedArray = new Uint8ClampedArray(videoWidth * videoHeight * 4);
  const minConfidence = 0.3;
  const maxConfidence = 0.8;
  const confidenceRange = maxConfidence - minConfidence;
  const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

  for (let i = 0; i < result.length; i++) {
    const confidence = result[i];
    const index = i * 4;
    dataArray[index] = confidence;
    dataArray[index + 1] = confidence;
    dataArray[index + 2] = confidence;
    // Aplha blending in the edge area to smooth the mask corners
    const edgeAlpha = (confidence - minConfidence) / confidenceRange;
    const alpha = clamp(edgeAlpha, 0, 1);

    dataArray[index + 3] = confidence * alpha; // set mask alpha value
  }
  const dataNew = new ImageData(dataArray, videoWidth, videoHeight);

  return createImageBitmap(dataNew);
}
