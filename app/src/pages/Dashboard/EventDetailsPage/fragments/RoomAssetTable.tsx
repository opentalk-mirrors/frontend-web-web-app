// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { AssetId, RoomId } from '@opentalk/rest-api-rtk-query';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useDeleteRoomAssetMutation, useGetRoomAssetsQuery } from '../../../../api/rest';
import { notifications } from '../../../../commonComponents';
import SuspenseLoading from '../../../../commonComponents/SuspenseLoading/SuspenseLoading';
import AssetTable from '../../../../components/AssetTable';
import { AssetDownloadBaseInfo, useDownloadRoomAsset } from '../../../../hooks/useDownloadRoomAsset';
import log from '../../../../logger';
import { RecurrenceInstance, checkAssetPredicate } from '../../../../utils/eventUtils';

interface RoomAssetTableProps {
  roomId: RoomId;
  isMeetingCreator: boolean;
  recurrenceInstance?: RecurrenceInstance;
}

const RoomAssetTable = ({ roomId, isMeetingCreator, recurrenceInstance }: RoomAssetTableProps) => {
  const { t } = useTranslation();
  const { data: assets, isLoading, isError } = useGetRoomAssetsQuery(roomId, { refetchOnMountOrArgChange: true });
  const [deleteRoomAsset] = useDeleteRoomAssetMutation();
  const downloadRoomAsset = useDownloadRoomAsset();

  const filteredAssets = useMemo(() => {
    if (!recurrenceInstance) {
      return assets;
    }

    return assets?.filter((asset) => checkAssetPredicate(asset.createdAt, recurrenceInstance));
  }, [assets]);

  const handleDownload = async ({ assetId, filename, fileSize, updateDownloadProgress }: AssetDownloadBaseInfo) => {
    return downloadRoomAsset({ roomId, assetId, filename, fileSize, updateDownloadProgress });
  };

  const handleDelete = async (assetId: AssetId) => {
    return await deleteRoomAsset({ roomId, assetId }).catch((error) => {
      log.error(`Error occured when deleting asset ${assetId}: `, error);
      notifications.error(t('asset-delete-error'));
    });
  };

  if (isLoading) return <SuspenseLoading />;

  if (isError || !filteredAssets || filteredAssets.length === 0) return null;

  return (
    <AssetTable
      assets={filteredAssets}
      onDownload={handleDownload}
      onDelete={isMeetingCreator ? handleDelete : undefined}
      maxHeight="17rem"
    />
  );
};

export default RoomAssetTable;
