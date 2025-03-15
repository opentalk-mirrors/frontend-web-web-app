// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
//
import { BackgroundProcessor, ProcessorWrapper } from '@livekit/track-processors';
import { LocalVideoTrack } from 'livekit-client';

import type { AppDispatch } from '../store';
import { BackgroundEffect, setBackgroundEffectsLoading } from '../store/slices/mediaSlice';

export const BLUR_RADIUS = 10;

const assetPaths = {
  tasksVisionFileSet: '/tflite',
  modelAssetPath: '/models/selfie_segmenter.tflite',
};

export const applyBackgroundEffectToTrack = async (
  videoTrack: LocalVideoTrack | undefined,
  videoBackgroundEffects: BackgroundEffect,
  dispatch: AppDispatch
) => {
  if (!videoTrack || videoTrack.isMuted) {
    return;
  }
  const isBlurred = videoBackgroundEffects.style === 'blur';
  const virtualBackgroundActive = videoBackgroundEffects.style === 'image';
  const imagePath = videoBackgroundEffects.imageUrl;
  const processor = videoTrack?.getProcessor() as ProcessorWrapper<Record<string, unknown>>;
  try {
    dispatch(setBackgroundEffectsLoading(true));
    if (isBlurred && (!processor || processor?.name !== 'background-blur')) {
      const blurProcessor = BackgroundProcessor({ assetPaths, blurRadius: BLUR_RADIUS }, 'background-blur');
      await videoTrack?.setProcessor(blurProcessor);
    } else if (virtualBackgroundActive && imagePath) {
      //eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      const previousImagePath = processor?.transformer?.options?.imagePath;
      if (previousImagePath !== imagePath) {
        await videoTrack?.setProcessor(BackgroundProcessor({ assetPaths, imagePath }, 'virtual-background'));
      }
    } else if (videoBackgroundEffects.style === 'off' && processor?.name) {
      await videoTrack?.stopProcessor();
    }
  } catch (error) {
    console.error('Error applying background effect:', error);
  } finally {
    dispatch(setBackgroundEffectsLoading(false));
  }
};
