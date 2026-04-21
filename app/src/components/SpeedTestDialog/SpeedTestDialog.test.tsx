// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import SpeedTestDialog from './SpeedTestDialog';

const mockDispatch = vi.fn();
const mockState = {
  speed: {
    download: 20,
    upload: 3,
    latency: 150,
  },
  config: {
    speedTest: {
      ndtServer: '',
      ndtDownloadWorkerJs: '/workers/ndt7-download-worker.js',
      ndtUploadWorkerJs: '/workers/ndt7-upload-worker.js',
    },
  },
};

const ndt7TestMock = vi.hoisted(() => vi.fn());

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('../../hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: typeof mockState) => unknown) => selector(mockState as never),
}));

vi.mock('../../commonComponents', () => ({
  CircularIconButton: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
}));

vi.mock('../../assets/icons', () => ({
  CloseIcon: (props: React.SVGProps<SVGSVGElement>) => <svg {...props} />,
  SpeedTestIcon: (props: React.SVGProps<SVGSVGElement>) => <svg {...props} />,
}));

vi.mock('@m-lab/ndt7', () => ({
  default: {
    test: ndt7TestMock,
  },
}));

describe('SpeedTestDialog', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    ndt7TestMock.mockReset();
    ndt7TestMock.mockImplementation((_options, handlers) => {
      handlers.downloadStart?.();
      handlers.downloadMeasurement?.({
        Source: 'server',
        Data: { TCPInfo: { MinRTT: 150_000 } },
      } as never);
      handlers.downloadComplete?.({
        LastClientMeasurement: { MeanClientMbps: mockState.speed.download },
      } as never);
      handlers.uploadComplete?.({
        LastClientMeasurement: { MeanClientMbps: mockState.speed.upload },
      } as never);

      return Promise.resolve();
    });
  });

  it('opens the dialog and triggers the speed test when the button is clicked', async () => {
    const user = userEvent.setup();
    render(<SpeedTestDialog />);

    const triggerButton = screen.getByRole('button', { name: 'speed-meter-button' });
    await user.click(triggerButton);

    await waitFor(() => expect(ndt7TestMock).toHaveBeenCalledTimes(1));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
  });

  it('displays results and enables restart once the test finishes', async () => {
    const user = userEvent.setup();
    render(<SpeedTestDialog />);

    await user.click(screen.getByRole('button', { name: 'speed-meter-button' }));

    await screen.findByText('speed-meter-stable-message');

    expect(screen.getByText('20.00')).toBeInTheDocument();
    expect(screen.getByText('3.00')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();

    const restartButton = screen.getByRole('button', { name: 'speed-meter-restart-button' });
    await waitFor(() => expect(restartButton).not.toBeDisabled());
  });
});
