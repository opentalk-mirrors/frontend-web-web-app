// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
//
import { BackgroundProcessor, ProcessorWrapper } from '@livekit/track-processors';
import { createLocalVideoTrack, LocalVideoTrack } from 'livekit-client';

import { BackgroundBlur } from '../modules/Media/BackgroundBlur';
import { type BackgroundEffect } from '../store/slices/mediaSlice';
import { getDeviceId } from './mediaUtils';

export const BLUR_RADIUS = 10;

const assetPaths = {
  tasksVisionFileSet: '/tflite',
  modelAssetPath: '/models/selfie_segmenter.tflite',
};

let customBlurProcessor: Promise<BackgroundBlur>;

export const applyBackgroundEffectToTrack = async (
  videoTrack: LocalVideoTrack | undefined,
  videoBackgroundEffects: BackgroundEffect,
  onLoadingChange: (loading: boolean) => void,
  deviceId?: string
) => {
  if (ProcessorWrapper.isSupported) {
    return applyLivekitBlurProcessor(videoTrack, videoBackgroundEffects, onLoadingChange);
  } else {
    //use the old way
    return applyCustomBlurProcessor(videoTrack, videoBackgroundEffects, onLoadingChange, deviceId);
  }
};

const applyLivekitBlurProcessor = async (
  videoTrack: LocalVideoTrack | undefined,
  videoBackgroundEffects: BackgroundEffect,
  onLoadingChange: (loading: boolean) => void
) => {
  if (!videoTrack || videoTrack.isMuted) {
    return;
  }
  onLoadingChange(true);

  const isBlurred = videoBackgroundEffects.style === 'blur';
  const imagePath = videoBackgroundEffects.imageUrl;
  const processor = videoTrack?.getProcessor() as ProcessorWrapper<Record<string, unknown>>;

  try {
    if (isBlurred && (!processor || processor?.name !== 'background-blur')) {
      const blurProcessor = BackgroundProcessor({ assetPaths, blurRadius: BLUR_RADIUS }, 'background-blur');
      await videoTrack?.setProcessor(blurProcessor);
    } else if (videoBackgroundEffects.style === 'image' && imagePath) {
      //eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      const previousImagePath = processor?.transformer?.options?.imagePath;
      if (previousImagePath !== imagePath) {
        await videoTrack?.setProcessor(BackgroundProcessor({ assetPaths, imagePath }, 'virtual-background'));
      }
    } else if (videoBackgroundEffects.style === 'off' && processor?.name) {
      await videoTrack?.stopProcessor();
    }
  } finally {
    onLoadingChange(false);
  }
};

const applyCustomBlurProcessor = async (
  videoTrack: LocalVideoTrack | undefined,
  videoBackgroundEffects: BackgroundEffect,
  onLoadingChange: (loading: boolean) => void,
  deviceId?: string
) => {
  if (!videoTrack || videoTrack.isMuted) {
    return;
  }

  const videoDeviceId = deviceId || getDeviceId(videoTrack.mediaStreamTrack);
  const isEffectActive = videoBackgroundEffects.style !== 'off';

  try {
    onLoadingChange(true);

    if (!customBlurProcessor) {
      customBlurProcessor = BackgroundBlur.create();
    }

    const processor = await customBlurProcessor;

    if (!isEffectActive) {
      processor.stop();
    }

    const rawLocalTrack = await createLocalVideoTrack({ deviceId: videoDeviceId });
    const outputTrack = isEffectActive
      ? await processor.start(rawLocalTrack.mediaStreamTrack, videoBackgroundEffects)
      : rawLocalTrack.mediaStreamTrack;

    if (videoTrack?.sender) {
      // in Conference
      await videoTrack.restartTrack();
      await videoTrack.replaceTrack(outputTrack);
    } else {
      // in Lobby
      return new MediaStream([outputTrack]);
    }
  } finally {
    onLoadingChange(false);
  }
};
