// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { AssetId, BaseAsset, RoomId, UserOwnedAsset } from '@opentalk/rest-api-rtk-query';
import { useTranslation } from 'react-i18next';

import { useDeleteRoomAssetMutation, useGetUserOwnedAssetsQuery } from '../../../../api/rest';
import { notifications } from '../../../../commonComponents';
import SuspenseLoading from '../../../../commonComponents/SuspenseLoading/SuspenseLoading';
import AssetTable from '../../../../components/AssetTable';
import { AssetDownloadBaseInfo, useDownloadRoomAsset } from '../../../../hooks/useDownloadRoomAsset';
import log from '../../../../logger';

export const UserAssetTable = () => {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useGetUserOwnedAssetsQuery(undefined, { refetchOnMountOrArgChange: true });
  const userAssets = data?.ownedAssets;
  const [deleteRoomAsset] = useDeleteRoomAssetMutation();
  const downloadRoomAsset = useDownloadRoomAsset();

  const mapUserOwnedAssetToBaseAsset = ({
    id,
    filename,
    createdAt,
    namespace,
    kind,
    size,
  }: UserOwnedAsset): BaseAsset => ({ id, filename, createdAt, namespace, kind, size });

  const getRoomId = (assetId: AssetId): RoomId | undefined => {
    if (userAssets && userAssets.length > 0) {
      const userAssetWithId = userAssets.find((userAsset) => userAsset.id === assetId);
      if (userAssetWithId) {
        return userAssetWithId.roomId;
      }
    }
  };

  const handleDownload = async ({ assetId, filename, fileSize, updateDownloadProgress }: AssetDownloadBaseInfo) => {
    const roomId = getRoomId(assetId);
    if (roomId) {
      return downloadRoomAsset({ roomId, assetId, filename, fileSize, updateDownloadProgress });
    }
  };

  const handleDelete = async (assetId: AssetId) => {
    const roomId = getRoomId(assetId);
    if (roomId) {
      return await deleteRoomAsset({ roomId, assetId }).catch((error) => {
        log.error(`Error occured when deleting asset ${assetId}: `, error);
        notifications.error(t('asset-delete-error'));
      });
    }
  };

  if (isLoading) return <SuspenseLoading />;

  if (isError || !userAssets || userAssets.length === 0) return null;

  const assets = userAssets.map(mapUserOwnedAssetToBaseAsset);

  return <AssetTable assets={assets} onDownload={handleDownload} onDelete={handleDelete} maxHeight="37rem" />;
};
