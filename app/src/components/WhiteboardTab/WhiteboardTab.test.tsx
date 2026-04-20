// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Mock } from 'vitest';

import { start as startWhiteboard } from '../../api/types/outgoing/whiteboard';
import { useDownloadRoomAsset } from '../../hooks/useDownloadRoomAsset';
import { configureStore, renderWithProviders } from '../../utils/testUtils';
import WhiteboardTab from './';

vi.mock('../../hooks/useDownloadRoomAsset', () => ({
  useDownloadRoomAsset: vi.fn(),
}));

vi.mock('../../api/types/outgoing/whiteboard', async (importOriginal) => ({
  ...(await importOriginal()),
  start: {
    action: vi.fn((payload) => ({ payload, type: 'TEST_START_WHITEBOARD' })),
  },
}));

describe('WhiteboardTab', () => {
  let { store, dispatchSpy } = configureStore();
  const roomId = '123';
  const pdfFile = 'file1.pdf';
  const pngFile = 'file2.png';

  beforeEach(() => {
    const configuredStore = configureStore({
      initialState: {
        config: {
          spacedeck: {
            enabled: false,
          },
          provider: {
            accountManagementUrl: 'https://account.opentalk.eu',
          },
        },
        whiteboard: {
          whiteboardAssetList: [
            { assetId: '1', filename: pdfFile },
            { assetId: '2', filename: pngFile },
          ],
          isWhiteboardAvailable: false,
        },
      },
    });
    store = configuredStore.store;
    dispatchSpy = configuredStore.dispatchSpy;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderComponent = () => {
    return renderWithProviders(
      <MemoryRouter initialEntries={[`/room/${roomId}`]}>
        <Routes>
          <Route path="/room/:roomId" element={<WhiteboardTab />} />
        </Routes>
      </MemoryRouter>,
      { store }
    );
  };

  it('renders whiteboard assets as links', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: pdfFile })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: pngFile })).toBeInTheDocument();
  });

  it('dispatches startWhiteboard when start button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();
    const startButton = screen.getByRole('button', { name: 'whiteboard-start-whiteboard-button' });
    await user.click(startButton);
    expect(dispatchSpy).toHaveBeenCalledExactlyOnceWith(
      startWhiteboard.action({
        initialScene: {
          elements: [],
        },
        editRestrictions: {
          type: 'disabled',
        },
      })
    );
  });

  it('calls downloadAsset function when clicking on a file link', async () => {
    const user = userEvent.setup();
    const mockDownload = vi.fn();
    (useDownloadRoomAsset as Mock).mockReturnValue(mockDownload);

    renderComponent();
    await user.click(screen.getByRole('button', { name: pdfFile }));
    expect(mockDownload).toHaveBeenCalledExactlyOnceWith({ roomId, assetId: '1' });
  });
});
