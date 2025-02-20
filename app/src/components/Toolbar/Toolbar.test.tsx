// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { Role } from '../../api/types/incoming/control';
import { renderWithProviders, configureStore, mockedParticipant } from '../../utils/testUtils';
import Toolbar from './Toolbar';

jest.mock('./fragments/VideoButton', () => ({
  ...jest.requireActual('./fragments/VideoButton'),
  __esModule: true,
  default: () => <div data-testid="videoButton"></div>,
}));
jest.mock('./fragments/AudioButton', () => ({
  ...jest.requireActual('./fragments/AudioButton'),
  __esModule: true,
  default: () => <div data-testid="audioButton"></div>,
}));

jest.mock('@livekit/components-react', () => ({
  useTrackToggle: () => ({ source: 'microphone' }),
  useRoomContext: () => jest.fn(),
  useLocalParticipant: () => ({ localParticipant: mockedParticipant(0) }),
  useLocalParticipantPermissions: () => jest.fn(),
}));

jest.mock('@livekit/components-core', () => ({
  sortParticipants: () => jest.fn(),
}));

jest.mock('livekit-client', () => ({
  Track: {
    Source: {
      Camera: 'camera',
      Microphone: 'microphone',
    },
  },
  VideoCaptureOptions: () => jest.fn(),
}));

describe('render <Toolbar />', () => {
  test('render full-layout Toolbar component for modarator', () => {
    const { store } = configureStore({
      initialState: {
        user: { loggedIn: true, role: Role.Moderator },
      },
    });
    renderWithProviders(<Toolbar />, { store, provider: { snackbar: true } });

    expect(screen.getByTestId('toolbarHandraiseButton')).toBeInTheDocument();
    expect(screen.getByTestId('toolbarBlurScreenButton')).toBeInTheDocument();
    expect(screen.getByTestId('audioButton')).toBeInTheDocument();
    expect(screen.getByTestId('videoButton')).toBeInTheDocument();
    expect(screen.getByTestId('toolbarMenuButton')).toBeInTheDocument();
    expect(screen.getByTestId('toolbarEndCallButton')).toBeInTheDocument();
  });

  test('render full-layout Toolbar component for normal user', () => {
    const { store } = configureStore({
      initialState: {
        user: { loggedIn: true, role: Role.User },
      },
    });
    renderWithProviders(<Toolbar />, { store, provider: { snackbar: true } });

    expect(screen.getByTestId('toolbarHandraiseButton')).toBeInTheDocument();
    expect(screen.getByTestId('toolbarBlurScreenButton')).toBeInTheDocument();
    expect(screen.getByTestId('audioButton')).toBeInTheDocument();
    expect(screen.getByTestId('videoButton')).toBeInTheDocument();
    expect(screen.getByTestId('toolbarMenuButton')).toBeInTheDocument();
    expect(screen.getByTestId('toolbarEndCallButton')).toBeInTheDocument();
  });
});
