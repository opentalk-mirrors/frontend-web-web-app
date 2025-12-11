// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { LocalAudioTrack, createAudioAnalyser } from 'livekit-client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import BrowserSupport from '../../../modules/BrowserSupport';
import { SignalLevel } from '../../../modules/Media/LevelNode';

const IndicatorContainer = styled('div')({
  overflow: 'hidden',
  position: 'absolute',
  width: '100%',
  height: '100%',
  borderRadius: 'inherit',
});

const fullCircle = 2 * Math.PI;
const startAngle = fullCircle * (2 / 12); // start at 5 o'clock
const scaleRange = (11 / 12) * fullCircle; // end at 4 o'clock
const lineWidth = 5; // px
const angleTick = Math.PI * 0.02;

const drawFillUp = (
  { peak, level }: SignalLevel,
  barColor: string,
  peakColor: string,
  ctx: CanvasRenderingContext2D
) => {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const audioLevelHeight = height - level * height;
  const audioPeakHeight = height - peak * height;

  ctx.fillStyle = barColor;
  ctx.strokeStyle = peakColor;
  ctx.fillRect(0, audioLevelHeight, width, height);
  ctx.beginPath();
  ctx.moveTo(0, audioPeakHeight);
  ctx.lineTo(width, audioPeakHeight);
  ctx.stroke();
};

const drawCircle = (
  { peak, level }: SignalLevel,
  barColor: string,
  peakColor: string,
  ctx: CanvasRenderingContext2D
) => {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const size = Math.min(width, height);
  const center = { x: width / 2, y: height / 2 };
  const radius = Math.max(1, Math.floor(size / 2 - lineWidth / 2));

  const levelAngle = scaleRange * level;
  const peakAngle = scaleRange * peak;

  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = barColor;
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, startAngle, startAngle + levelAngle);
  ctx.stroke();

  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = peakColor;
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, startAngle + peakAngle - angleTick, startAngle + peakAngle + angleTick);
  ctx.stroke();
};

interface AudioIndicatorProps {
  shape: 'circle' | 'bar';
  localAudioTrack: LocalAudioTrack;
}

const UPDATE_VOLUME_INTERVAL = 1000 / 30;
const PEAK_DECAY_RATE = 0.01;
const MIN_PEAK_LEVEL = 0.05;

const AudioIndicator = ({ shape, localAudioTrack }: AudioIndicatorProps) => {
  const [signalLevel, setSignalLevel] = useState<SignalLevel>({
    peak: 0,
    level: 0,
    clip: false,
  });

  const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const needsClearCanvasHack = useMemo(() => BrowserSupport.isSafari(), []);
  const [{ width, height }, setDimensions] = useState({ width: 2 * lineWidth, height: 2 * lineWidth });

  const handleResize = useCallback(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });
    }
  }, []);

  useEffect(() => {
    if (!localAudioTrack) {
      return;
    }

    const { cleanup, analyser } = createAudioAnalyser(localAudioTrack);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateVolume = () => {
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const a = dataArray[i];
        sum += a * a;
      }
      setSignalLevel((prev) => {
        const level = Math.sqrt(sum / dataArray.length) / 255;
        const peak = prev.peak > level ? prev.peak : level;

        return {
          ...prev,
          level,
          peak,
        };
      });
    };

    const interval = setInterval(updateVolume, UPDATE_VOLUME_INTERVAL);

    return () => {
      cleanup();
      clearInterval(interval);
    };
  }, [localAudioTrack, localAudioTrack?.mediaStreamTrack]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [handleResize]);

  useEffect(() => {
    const peakDecayInterval = setInterval(() => {
      setSignalLevel((prev) => ({
        ...prev,
        peak: Math.max(prev.peak - PEAK_DECAY_RATE, MIN_PEAK_LEVEL),
      }));
    }, 50);

    return () => {
      clearInterval(peakDecayInterval);
    };
  }, []);

  const render = useCallback(
    function renderFrame() {
      const ctx = canvasRef.current?.getContext('2d') || null;
      if (ctx === null) {
        return;
      }

      if (signalLevel === undefined) {
        return;
      }
      if (needsClearCanvasHack) {
        // clearRect is broken so we need a hack:
        const width = ctx.canvas.width;
        ctx.canvas.width = width;
      }
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      const { peak, level, clip } = signalLevel;

      let barColor: string;
      if (clip) {
        barColor = theme.palette.error.main;
      } else if (level > 0) {
        barColor = theme.palette.secondary.main;
      } else {
        barColor = theme.palette.text.disabled;
      }
      const peakColor = theme.palette.background.customPaper.primary;

      if (shape === 'circle') {
        drawCircle({ peak, level, clip }, barColor, peakColor, ctx);
      } else {
        drawFillUp({ peak, level, clip }, barColor, peakColor, ctx);
      }

      animationRef.current = requestAnimationFrame(renderFrame);
    },
    [theme, shape, needsClearCanvasHack, signalLevel]
  );

  useEffect(() => {
    render();
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [render]);

  return (
    <IndicatorContainer ref={containerRef}>
      <canvas ref={canvasRef} width={width} height={height} />
    </IndicatorContainer>
  );
};

export default AudioIndicator;
