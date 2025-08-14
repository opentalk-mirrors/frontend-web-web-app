// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { AssetId, RoomId } from '@opentalk/rest-api-rtk-query';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from '.';
import { notifications } from '../commonComponents';
import log from '../logger';
import { selectControllerUrl } from '../store/slices/configSlice';
import { fetchWithAuth } from '../utils/apiUtils';

export interface AssetDownloadBaseInfo {
  assetId: AssetId;
  filename: string;
  fileSize?: number;
  updateDownloadProgress?: (progressPercentage: number) => void;
}

interface AssetDownloadInfo extends AssetDownloadBaseInfo {
  baseURL: string;
  roomId: RoomId;
}

const downloadRoomAsset = async ({
  baseURL,
  roomId,
  assetId,
  filename,
  fileSize,
  updateDownloadProgress: onDownloadProgress,
}: AssetDownloadInfo) => {
  const downloadURL = new URL(`v1/rooms/${roomId}/assets/${assetId}`, baseURL);

  const response = await fetchWithAuth(downloadURL);
  if (response.status !== 200) {
    throw Error(`Something went wrong when trying to download asset. Request returned status: ${response.status}`);
  }

  let blob: Blob;
  if (fileSize && onDownloadProgress) {
    // Reading the response body as a stream so we can calculate download progress.
    const reader = response.body?.getReader();
    const chunks: Uint8Array<ArrayBuffer>[] = [];
    let loadedBytes = 0;
    const done = false;

    if (!reader) {
      return;
    }

    while (!done) {
      const { done: streamDone, value } = await reader.read();
      if (streamDone) {
        break;
      }

      loadedBytes += value.length;
      onDownloadProgress?.((loadedBytes / fileSize) * 100);

      chunks.push(value);
    }

    blob = new Blob(chunks);
  } else {
    blob = await response.blob();
  }

  const hiddenElement = document.createElement('a');
  const url = window.URL || window.webkitURL;
  const blobURL = url.createObjectURL(blob);

  hiddenElement.href = blobURL;
  hiddenElement.target = '_blank';
  hiddenElement.download = filename;
  hiddenElement.click();

  hiddenElement.parentNode?.removeChild(hiddenElement);
  url.revokeObjectURL(blobURL);
};

export const useDownloadRoomAsset = () => {
  const { t } = useTranslation();
  const controllerUrl = useAppSelector(selectControllerUrl);

  return function ({
    roomId,
    assetId,
    filename,
    fileSize,
    updateDownloadProgress: onDownloadProgress,
  }: Omit<AssetDownloadInfo, 'baseURL'>) {
    return downloadRoomAsset({
      baseURL: controllerUrl,
      roomId,
      assetId,
      filename,
      fileSize,
      updateDownloadProgress: onDownloadProgress,
    }).catch((error) => {
      log.error(`Error downloading asset ${assetId}: `, error);
      notifications.error(t('asset-download-error'));
    });
  };
};
