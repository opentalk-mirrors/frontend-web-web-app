// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
//
// The `useManageVideoEffect` hook manages the local video track in a LiveKit environment,
// applying background effects like blur or virtual backgrounds based on user settings.
// It handles processor support for effects and provides a fallback blur option if unsupported.
import { useMaybeRoomContext } from '@livekit/components-react';
import { BackgroundProcessor, ProcessorWrapper } from '@livekit/track-processors';
import { ConnectionState, LocalVideoTrack, VideoCaptureOptions } from 'livekit-client';
import { useCallback, useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from '.';
import { BackgroundBlur } from '../modules/Media/BackgroundBlur';
import { useMediaChoices } from '../provider/MediaChoicesProvider';
import { selectVideoBackgroundEffects, setBackgroundEffectsLoading } from '../store/slices/mediaSlice';

export const BLUR_RADIUS = 10;

export const useManageVideoEffect = (isLobby?: boolean, videoTrack?: LocalVideoTrack) => {
  const dispatch = useAppDispatch();
  const mediaChoices = useMediaChoices();
  const room = useMaybeRoomContext();
  const backgroundEffects = useAppSelector(selectVideoBackgroundEffects);

  const [localVideoTrack, setLocalVideoTrack] = useState<LocalVideoTrack | undefined>(videoTrack);
  const [fallbackBlurProcessor, setFallbackBlurProcessor] = useState<BackgroundBlur | null>(null);

  const isBlurred = backgroundEffects.style === 'blur';
  const virtualBackgroundActive = backgroundEffects.style === 'image';
  const imagePath = backgroundEffects.imageUrl;
  const isUserVideoEnabled = mediaChoices?.userChoices.videoEnabled || false;
  const deviceId = mediaChoices?.userChoices.videoDeviceId;

  const localVideoTrackIsSet = localVideoTrack !== undefined;

  // In addition to the currently used `tflite' files, the following files had to be added to prevent livekit from downloading them from the CDN
  const assetPaths = {
    tasksVisionFileSet: '/tflite',
    modelAssetPath: '/models/selfie_segmenter.tflite',
  };

  useEffect(() => {
    setLocalVideoTrack(videoTrack);
  }, [videoTrack]);

  useEffect(() => {
    const isRoomConnected = room?.state === ConnectionState.Connected;
    const processor = localVideoTrack?.getProcessor();
    let dismounted = false;

    let videoCaptureOptions: VideoCaptureOptions = {
      deviceId,
    };

    if (ProcessorWrapper.isSupported) {
      if (isBlurred && (!processor || processor?.name !== 'background-blur')) {
        videoCaptureOptions = {
          ...videoCaptureOptions,
          processor: BackgroundProcessor({ assetPaths, blurRadius: BLUR_RADIUS }, 'background-blur'),
        };
      } else if (virtualBackgroundActive && imagePath) {
        videoCaptureOptions = {
          ...videoCaptureOptions,
          processor: BackgroundProcessor({ assetPaths, imagePath }, 'virtual-background'),
        };
      }
    }

    if (!isLobby && isRoomConnected) {
      room.localParticipant.setCameraEnabled(isUserVideoEnabled, videoCaptureOptions).then((publication) => {
        if (dismounted) {
          room.localParticipant.setCameraEnabled(false);
          return;
        }

        setLocalVideoTrack(publication?.videoTrack);
      });
    }
    return () => {
      dismounted = true;
    };
  }, [
    deviceId,
    isLobby,
    isUserVideoEnabled,
    room?.localParticipant.setCameraEnabled,
    room?.state,
    imagePath,
    isBlurred,
    virtualBackgroundActive,
    localVideoTrack,
  ]);

  const applyBackgroundEffect = useCallback(async () => {
    const processor = localVideoTrack?.getProcessor();
    try {
      dispatch(setBackgroundEffectsLoading(true));
      if (isBlurred && (!processor || processor?.name !== 'background-blur')) {
        const blurProcessor = BackgroundProcessor({ assetPaths, blurRadius: BLUR_RADIUS }, 'background-blur');
        await localVideoTrack?.setProcessor(blurProcessor);
      } else if (virtualBackgroundActive && imagePath) {
        await localVideoTrack?.setProcessor(BackgroundProcessor({ assetPaths, imagePath }, 'virtual-background'));
      } else if (backgroundEffects.style === 'off' && processor?.name) {
        await localVideoTrack?.stopProcessor();
      }
    } catch (error) {
      console.error('Error applying background effect:', error);
    } finally {
      dispatch(setBackgroundEffectsLoading(false));
    }
  }, [
    isBlurred,
    imagePath,
    backgroundEffects.style,
    virtualBackgroundActive,
    localVideoTrack?.setProcessor,
    localVideoTrack?.getProcessor,
    localVideoTrack?.stopProcessor,
    dispatch,
  ]);

  const getTrack = useCallback(async () => {
    let usedTrack = localVideoTrack?.mediaStreamTrack;

    if (!usedTrack?.getSettings()?.width) {
      const newTrack = await room?.localParticipant.createTracks({ video: { deviceId } });
      // The `createTracks` function returns an array of tracks, from which we just need the video track
      // Since it's not possible to request a single track directly, we extract the first one from the array
      usedTrack = newTrack?.[0].mediaStreamTrack;
    }

    return usedTrack;
  }, [localVideoTrack?.mediaStreamTrack, room?.localParticipant, deviceId]);

  const handleFallbackBackgroundEffect = useCallback(async () => {
    try {
      dispatch(setBackgroundEffectsLoading(true));
      if ((isBlurred || virtualBackgroundActive) && localVideoTrackIsSet) {
        fallbackBlurProcessor?.stop();
        const blurProcessor = await BackgroundBlur.create();
        setFallbackBlurProcessor(blurProcessor);

        const usedTrack = await getTrack();

        const blurredTrack = usedTrack && (await blurProcessor.start(usedTrack, backgroundEffects));
        if (blurredTrack && localVideoTrack?.sender) {
          await localVideoTrack.replaceTrack(blurredTrack);
        } else {
          console.warn('Track is unpublished, unable to replace the track');
        }
      } else if (backgroundEffects.style === 'off') {
        const newTrack = await room?.localParticipant.createTracks({ video: { deviceId } });
        if (newTrack && newTrack.length > 0) localVideoTrack?.replaceTrack(newTrack[0].mediaStreamTrack);
        fallbackBlurProcessor?.stop();
        setFallbackBlurProcessor(null);
      }
    } catch (error) {
      console.error('Error applying background effect:', error);
    } finally {
      dispatch(setBackgroundEffectsLoading(false));
    }
  }, [
    backgroundEffects,
    isBlurred,
    fallbackBlurProcessor,
    virtualBackgroundActive,
    deviceId,
    getTrack,
    localVideoTrack?.replaceTrack,
    localVideoTrack?.sender,
    localVideoTrackIsSet,
  ]);

  useEffect(() => {
    const handleBackgroundEffect = async () => {
      if (!localVideoTrackIsSet) return;

      if (ProcessorWrapper.isSupported) {
        await applyBackgroundEffect();
      } else {
        await handleFallbackBackgroundEffect();
      }
    };

    if (!localVideoTrack?.isMuted) handleBackgroundEffect();
  }, [localVideoTrack?.isMuted, localVideoTrackIsSet, backgroundEffects.style, backgroundEffects.imageUrl]);

  useEffect(() => {
    return () => {
      if (ProcessorWrapper.isSupported) {
        localVideoTrack?.stopProcessor();
      } else {
        fallbackBlurProcessor?.stop();
        setFallbackBlurProcessor(null);
      }
    };
  }, [localVideoTrack]);
};
