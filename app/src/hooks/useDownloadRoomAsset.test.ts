// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { AssetId, RoomId } from '@opentalk/rest-api-rtk-query';
import { act } from '@testing-library/react';

import { configureStore, renderHookWithProviders } from '../utils/testUtils';
import { useDownloadRoomAsset } from './useDownloadRoomAsset';

vi.mock('../utils/apiUtils', async (importOriginal) => ({
  ...(await importOriginal()),
  fetchWithAuth: vi.fn(),
}));

const { fetchWithAuth } = await import('../utils/apiUtils');

const renderUseDownloadRoomAsset = () => {
  const { store } = configureStore({
    initialState: {
      config: {
        insecure: false,
        controller: 'controller.example.com',
      },
    },
  });
  return renderHookWithProviders(() => useDownloadRoomAsset(), { store });
};

describe('useDownloadRoomAsset', () => {
  const roomId = 'room-1' as RoomId;
  const assetId = 'asset-1' as AssetId;
  const signedDownloadUrl = 'https://controller.example.com/v1/rooms/room-1/assets/asset-1/download/signed';

  beforeEach(() => {
    vi.mocked(fetchWithAuth).mockResolvedValue(
      new Response(JSON.stringify({ url: signedDownloadUrl }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('opens the signed URL in a new browsing context and does not navigate the conference tab', async () => {
    // Regression test: navigating the current tab via `window.location.assign`
    // causes Firefox to tear down the active signaling WebSocket
    const assignSpy = vi.spyOn(window.location, 'assign').mockImplementation(() => {});
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);

    const { result } = renderUseDownloadRoomAsset();

    await act(async () => {
      await result.current({ roomId, assetId });
    });

    expect(assignSpy).not.toHaveBeenCalled();
    expect(openSpy).toHaveBeenCalledExactlyOnceWith(signedDownloadUrl, '_blank', 'noopener,noreferrer');
  });
});
