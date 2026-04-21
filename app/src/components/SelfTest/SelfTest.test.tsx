// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Typography } from '@mui/material';
import { screen } from '@testing-library/react';
import { PropsWithChildren } from 'react';

import { CommonTextField } from '../../commonComponents';
import { renderWithProviders, configureStore } from '../../utils/testUtils';
import SelfTest from './SelfTest';

vi.mock('../../utils/apiUtils');

vi.mock('../../api/rest', async (importOriginal) => ({
  ...(await importOriginal()),
  useGetRoomEventInfoQuery: () => ({
    data: {},
  }),
}));

vi.mock('@livekit/components-react', () => ({
  useRoomContext: () => vi.fn(),
  useMediaDeviceSelect: () => [
    { deviceId: 'xxxxx', groupId: 'xxxxxx', kind: 'audioinput', label: 'audio' },
    { deviceId: 'xxxx1', groupId: 'xxxxx1', kind: 'videoinput', label: 'video' },
  ],
}));

vi.mock('./fragments/ToolbarContainer', () => ({
  default: ({ children }: PropsWithChildren) => {
    return <div data-testid="buttomContainer"> {children}</div>;
  },
}));

describe('SelfTest', () => {
  const { store } = configureStore({
    initialState: {
      config: {
        features: {},
        speedTest: {
          ndtServer: 'ndt.testserver.com',
        },
      },
    },
  });

  it('renders SelfTest component without crashing', () => {
    renderWithProviders(
      <SelfTest>
        <CommonTextField label="label" color="secondary" placeholder="global-name-placeholder" />
      </SelfTest>,
      { store, provider: { router: true, mui: true } }
    );

    expect(screen.getByText('selftest-body')).toBeInTheDocument();

    expect(screen.getByPlaceholderText('global-name-placeholder')).toBeInTheDocument();

    expect(screen.getByLabelText('speed-meter-button')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'speed-meter-button' })).toBeInTheDocument();

    expect(screen.getByTestId('buttomContainer')).toBeInTheDocument();
    expect(screen.queryByTestId('toolbarBlurScreenButton')).not.toBeInTheDocument();
    expect(screen.queryByTestId('toolbarHandraiseButton')).not.toBeInTheDocument();
    expect(screen.queryByTestId('toolbarMenuButton')).not.toBeInTheDocument();
    expect(screen.queryByTestId('toolbarEndCallButton')).not.toBeInTheDocument();
  });

  it('renders SelfTest header as h2', () => {
    renderWithProviders(
      <SelfTest>
        <CommonTextField label="label" color="secondary" placeholder="global-name-placeholder" />
      </SelfTest>,
      { store, provider: { router: true, mui: true } }
    );
    const headerElement = screen.getByText('selftest-header');
    expect(headerElement).toBeInTheDocument();
    expect(headerElement.tagName).toBe('H2');
  });

  it('renders room title as h1', () => {
    renderWithProviders(
      <SelfTest>
        <CommonTextField label="label" color="secondary" placeholder="global-name-placeholder" />
        <Typography
          variant="h2"
          component="h1"
          sx={{
            textAlign: 'center',
          }}
        >
          joinform-room-title
        </Typography>
      </SelfTest>,
      { store, provider: { router: true, mui: true } }
    );
    const titleElement = screen.getByText('joinform-room-title');
    expect(titleElement).toBeInTheDocument();
    expect(titleElement.tagName).toBe('H1');
  });

  it('hides SpeedTestDialog when ndtServer is not configured', () => {
    const { store } = configureStore({
      initialState: {
        config: {
          features: {},
          speedTest: {
            ndtServer: '',
            ndtDownloadWorkerJs: '/workers/ndt7-download-worker.js',
            ndtUploadWorkerJs: '/workers/ndt7-upload-worker.js',
          },
        },
      },
    });

    renderWithProviders(
      <SelfTest>
        <CommonTextField label="label" color="secondary" placeholder="global-name-placeholder" />
      </SelfTest>,
      { store, provider: { router: true, mui: true } }
    );

    expect(screen.queryByRole('button', { name: 'speed-meter-button' })).not.toBeInTheDocument();
  });

  it('shows SpeedTestDialog when ndtServer is configured', () => {
    const { store } = configureStore({
      initialState: {
        config: {
          features: {},
          speedTest: {
            ndtServer: 'ndt.testserver.com',
            ndtDownloadWorkerJs: '/workers/ndt7-download-worker.js',
            ndtUploadWorkerJs: '/workers/ndt7-upload-worker.js',
          },
        },
      },
    });

    renderWithProviders(
      <SelfTest>
        <CommonTextField label="label" color="secondary" placeholder="global-name-placeholder" />
      </SelfTest>,
      { store, provider: { router: true, mui: true } }
    );

    expect(screen.getByRole('button', { name: 'speed-meter-button' })).toBeInTheDocument();
  });
});
