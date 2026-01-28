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
}

interface AssetDownloadInfo extends AssetDownloadBaseInfo {
  baseURL: string;
  roomId: RoomId;
}

interface DownloadPathResponse {
  url: string;
}

const downloadRoomAsset = async ({ baseURL, roomId, assetId }: AssetDownloadInfo) => {
  const downloadUrlEndpoint = new URL(`v1/rooms/${roomId}/assets/${assetId}/download?redirect=false`, baseURL);

  try {
    const response = await fetchWithAuth(downloadUrlEndpoint);
    if (!response.ok) {
      throw new Error(`Failed to fetch download path. Status: ${response.status}`);
    }

    const { url } = (await response.json()) as DownloadPathResponse;
    const downloadUrl = new URL(url, downloadUrlEndpoint).toString();
    window.location.assign(downloadUrl);
  } catch (e) {
    log.error('Signed URL download failed', e);
    throw e;
  }
};

export const useDownloadRoomAsset = () => {
  const { t } = useTranslation();
  const controllerUrl = useAppSelector(selectControllerUrl);

  return ({ roomId, assetId }: Omit<AssetDownloadInfo, 'baseURL'>) =>
    downloadRoomAsset({ baseURL: controllerUrl, roomId, assetId }).catch((error) => {
      log.error(`Error downloading asset ${assetId}: `, error);
      notifications.error(t('asset-download-error'));
    });
};
