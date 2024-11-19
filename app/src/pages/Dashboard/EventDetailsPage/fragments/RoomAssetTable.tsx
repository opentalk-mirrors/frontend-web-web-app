// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { RoomId, AssetId } from '@opentalk/rest-api-rtk-query';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useGetRoomAssetsQuery, useDeleteRoomAssetMutation } from '../../../../api/rest';
import { notifications } from '../../../../commonComponents';
import SuspenseLoading from '../../../../commonComponents/SuspenseLoading/SuspenseLoading';
import AssetTable from '../../../../components/AssetTable';
import { useDownloadAction } from '../../../../hooks/download';
import { checkAssetPredicate, RecurrenceInstance } from '../../../../utils/eventUtils';

interface RoomAssetTableProps {
  roomId: RoomId;
  isMeetingCreator: boolean;
  recurrenceInstance?: RecurrenceInstance;
}

const RoomAssetTable = ({ roomId, isMeetingCreator, recurrenceInstance }: RoomAssetTableProps) => {
  const { t } = useTranslation();
  const { data: assets, isLoading, isError } = useGetRoomAssetsQuery(roomId, { refetchOnMountOrArgChange: true });
  const [deleteRoomAsset] = useDeleteRoomAssetMutation();
  const downloadRoomAsset = useDownloadAction();

  const filteredAssets = useMemo(() => {
    if (!recurrenceInstance) {
      return assets;
    }

    return assets?.filter((asset) => checkAssetPredicate(asset.createdAt, recurrenceInstance));
  }, [assets]);

  const handleDownload = async (assetId: AssetId, filename: string) => {
    return downloadRoomAsset(roomId, assetId, filename);
  };

  const handleDelete = async (assetId: AssetId) => {
    return await deleteRoomAsset({ roomId, assetId }).catch((error) => {
      console.error(`Error occured when deleting asset ${assetId}: `, error);
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
