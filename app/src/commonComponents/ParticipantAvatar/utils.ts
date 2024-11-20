// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { LibravatarDefaultImage } from '../../types';

const DEFAULT_IMAGE_SIZE = 512;

// Options to modify image size and the default image, if no image is provided.
// See "Picture size" and "Default URL for missing images" section in the documentation https://wiki.libravatar.org/api/
type LibravatarOptions = {
  size?: number;
  defaultImage?: LibravatarDefaultImage;
};

/**
 * Add options to specify picture size and default image of an avatar
 *
 * @param url     An avatar URL
 * @param options size and default image
 */
export const setLibravatarOptions = (
  url: string | undefined,
  { size = DEFAULT_IMAGE_SIZE, defaultImage = 'robohash' }: LibravatarOptions
) => {
  return url ? `${url}?d=${defaultImage}&s=${size}` : undefined;
};
