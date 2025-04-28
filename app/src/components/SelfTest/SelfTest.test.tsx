// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Typography } from '@mui/material';
import { screen } from '@testing-library/react';
import { PropsWithChildren } from 'react';

import { CommonTextField } from '../../commonComponents';
import { renderWithProviders, configureStore } from '../../utils/testUtils';
import SelfTest from './SelfTest';

jest.mock('../../utils/apiUtils');

jest.mock('../../api/rest', () => ({
  ...jest.requireActual('../../api/rest'),
  useGetRoomEventInfoQuery: () => ({
    data: {},
  }),
}));

jest.mock('@livekit/components-react', () => ({
  useRoomContext: () => jest.fn(),
  useMediaDeviceSelect: () => [
    { deviceId: 'xxxxx', groupId: 'xxxxxx', kind: 'audioinput', label: 'audio' },
    { deviceId: 'xxxx1', groupId: 'xxxxx1', kind: 'videoinput', label: 'video' },
  ],
}));

jest.mock('./fragments/ToolbarContainer', () => ({
  ...jest.requireActual('./fragments/ToolbarContainer'),
  __esModule: true,
  default: ({ children }: PropsWithChildren) => {
    return <div data-testid="buttomContainer"> {children}</div>;
  },
}));

describe('SelfTest', () => {
  const { store } = configureStore();

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
});
