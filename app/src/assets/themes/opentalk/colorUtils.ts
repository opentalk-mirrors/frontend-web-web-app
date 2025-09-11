// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import Color from 'colorjs.io';

// APCA contrasts can be negative so these values represent the absolute values
// negative values indicate bright color on dark background
// positive values indicate dark color on light background
export enum ContrastThreshold {
  MAX = 90, //maximum contrast for very large and/or bold text
  BodyMin = 75, //minimum for body text that is small and in paragraphs
  ButtonMin = 60, //minimum for labels, buttons, etc.
  HeadlineMin = 45, //minimum for headlines, titles, etc.
  DisabledMin = 30, //minimum for disabled elements or placeholder text
  MIN = 15, //absolute minimum, should only be used for non-text elements like outlines, dividers, etc.
}

/**
 * Returns the color with the highest contrast against the given background color.
 * It compares the contrast of each candidate color with the given contrast threshold
 * If non matches it checks if white or black has a higher contrast against the background
 * @param background string representing the background color
 * @param options optional object to specify contrast threshold
 * @param options.contrastThreshold defaults to ContrastThreshold.BodyMin
 * @param candidates array of candidate colors to compare against the background
 * @returns {string} The color with the highest contrast against the background
 */
export function getContrastColor(
  background: string,
  options?: { contrastThreshold?: ContrastThreshold },
  ...candidates: string[]
): string {
  const contrastThreshold = options?.contrastThreshold || ContrastThreshold.BodyMin;
  if (!background || !candidates) {
    return '#fff';
  }
  const backgroundColor = new Color(background);

  const contrasts = candidates.map((candidate) => Math.abs(backgroundColor.contrast(new Color(candidate), 'APCA')));
  const maxContrast = Math.max(...contrasts);

  if (maxContrast > contrastThreshold) {
    const maxContrastIndex = contrasts.indexOf(maxContrast);
    return candidates[maxContrastIndex];
  } else {
    const whiteContrast = Math.abs(backgroundColor.contrast(new Color('#fff'), 'APCA'));
    const blackContrast = Math.abs(backgroundColor.contrast(new Color('#000'), 'APCA'));
    return whiteContrast > blackContrast ? '#fff' : '#000';
  }
}

const contrastCache = new Map<string, string>();

export function getContrastText(
  text: string | Color,
  background: string | Color,
  threshold: ContrastThreshold = ContrastThreshold.BodyMin
) {
  const textColor = new Color(text);
  const backgroundColor = new Color(background);

  const textKey = textColor.toString({ format: 'rgba' });
  const backgroundKey = backgroundColor.toString({ format: 'rgba' });
  const cacheKey = `${textKey}-${backgroundKey}-${threshold}`;

  if (contrastCache.has(cacheKey)) {
    return contrastCache.get(cacheKey)!;
  }

  const result = matchThreshold(
    textColor,
    backgroundColor,
    threshold,
    backgroundColor.oklch.l <= 0.5 ? 0.01 : -0.01 // Adjust luminance based on contrast direction
  );

  contrastCache.set(cacheKey, result);
  return result;
}

function adjustLightness(color: Color, amount: number): Color {
  color.oklch.l = Math.min(Math.max(color.oklch.l + amount, 0), 1); // Ensure lightness stays within [0, 1];
  return color;
}

export function otDarken(color: string, amount: number): string {
  return adjustLightness(new Color(color), -amount).toString({ format: 'rgb' });
}

export function otLighten(color: string, amount: number): string {
  return adjustLightness(new Color(color), amount).toString({ format: 'rgb' });
}

function matchThreshold(color: Color, backgroundColor: Color, threshold: ContrastThreshold, step: number): string {
  let adjustedColor = color.clone();
  for (let i = 0; i < 10; i++) {
    // Limit iterations to prevent infinite loops
    adjustedColor = adjustLightness(adjustedColor, step);
    const contrast = backgroundColor.contrast(adjustedColor, 'APCA');
    if (contrast > threshold) {
      return adjustedColor.to('srgb').toString();
    }
  }
  return step > 0 ? '#FFF' : '#000'; // Fallback if no suitable contrast is found
}
