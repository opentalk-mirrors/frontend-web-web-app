// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { RoomId } from '@opentalk/rest-api-rtk-query';
import { screen } from '@testing-library/react';
import { ComponentProps } from 'react';

import { useDeleteRoomAssetMutation, useGetRoomAssetsQuery } from '../../../../api/rest';
import { useDownloadRoomAsset } from '../../../../hooks/useDownloadRoomAsset';
import { renderWithProviders } from '../../../../utils/testUtils';
import RoomAssetTable from './RoomAssetTable';

vi.mock(import('../../../../api/rest'), async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    useGetRoomAssetsQuery: vi.fn(),
    useDeleteRoomAssetMutation: vi.fn(),
  };
});

vi.mock(import('../../../../hooks/useDownloadRoomAsset'), async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    useDownloadRoomAsset: vi.fn(),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useGetRoomAssetsQuery).mockReturnValue({
    data: [],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  });
  vi.mocked(useDeleteRoomAssetMutation).mockReturnValue([
    vi.fn().mockResolvedValue({ data: undefined }),
    { reset: vi.fn() },
  ]);
  vi.mocked(useDownloadRoomAsset).mockReturnValue(vi.fn());
});

describe('RoomAssetTable', () => {
  it('renders sorted assets from latest to oldest regardless of the original order.', () => {
    const props: ComponentProps<typeof RoomAssetTable> = {
      roomId: 'room-123' as RoomId,
      isMeetingCreator: false,
    };
    vi.mocked(useGetRoomAssetsQuery).mockReturnValueOnce({
      data: [
        {
          createdAt: '2023-10-01T12:00:00Z',
          filename: 'asset_3.txt',
          id: 'asset-3',
        },
        {
          createdAt: '2023-10-01T14:00:00Z',
          filename: 'asset_1.txt',
          id: 'asset-1',
        },
        {
          createdAt: '2023-10-01T13:00:00Z',
          filename: 'asset_2.txt',
          id: 'asset-2',
        },
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    renderWithProviders(<RoomAssetTable {...props} />, { provider: { mui: true } });
    const cells = screen.getAllByRole('cell', { name: /asset_\d\.txt/i });
    expect(cells).toHaveLength(3);
    expect(cells[0]).toHaveTextContent('asset_1.txt');
    expect(cells[1]).toHaveTextContent('asset_2.txt');
    expect(cells[2]).toHaveTextContent('asset_3.txt');
  });
});
