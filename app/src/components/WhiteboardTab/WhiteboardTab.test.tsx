// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Mock } from 'vitest';

import { startWhiteboard, generateWhiteboardPdf } from '../../api/types/outgoing/whiteboard';
import { useDownloadRoomAsset } from '../../hooks/useDownloadRoomAsset';
import { configureStore, renderWithProviders } from '../../utils/testUtils';
import WhiteboardTab from './';

vi.mock('../../hooks/useDownloadRoomAsset', () => ({
  useDownloadRoomAsset: vi.fn(),
}));

describe('WhiteboardTab', () => {
  let { store, dispatchSpy } = configureStore();
  const roomId = '123';
  const pdfFile = 'file1.pdf';
  const pngFile = 'file2.png';

  beforeEach(() => {
    const configuredStore = configureStore({
      initialState: {
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

  it('dispatches startWhiteboard when start button is clicked', () => {
    renderComponent();
    const startButton = screen.getByRole('button', { name: 'whiteboard-start-whiteboard-button' });
    fireEvent.click(startButton);
    expect(dispatchSpy).toHaveBeenCalledWith(startWhiteboard.action());
  });

  it('dispatches generateWhiteboardPdf when create PDF button is clicked', () => {
    const configuredStore = configureStore({
      initialState: {
        whiteboard: { whiteboardAssetList: [], isWhiteboardAvailable: true },
      },
    });

    store = configuredStore.store;
    dispatchSpy = configuredStore.dispatchSpy;

    renderComponent();
    const pdfButton = screen.getByRole('button', { name: 'whiteboard-create-pdf-button' });
    fireEvent.click(pdfButton);
    expect(dispatchSpy).toHaveBeenCalledWith(generateWhiteboardPdf.action());
  });

  it('calls downloadAsset function when clicking on a file link', () => {
    const mockDownload = vi.fn();
    (useDownloadRoomAsset as Mock).mockReturnValue(mockDownload);

    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: pdfFile }));
    expect(mockDownload).toHaveBeenCalledWith({ roomId, assetId: '1', filename: pdfFile });
  });
});
