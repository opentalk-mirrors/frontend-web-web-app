// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { cleanup, screen, fireEvent } from '@testing-library/react';
import { PropsWithChildren } from 'react';

import { renderWithProviders, configureStore } from '../../utils/testUtils';
import FullscreenView from './FullscreenView';

/**
 * By default, jest is hoisting all mock calls to the top, and when
 * declaring outside function with block scope keywords we end up with
 * the error that variable cannot be used before declaration.
 * This is why we have to define exit mock function as var in order to hoist
 * on top of the mock call.
 */
const mockExitCall = jest.fn();

jest.mock('../../hooks/useFullscreenContext.ts', () => ({
  useFullscreenContext: () => ({
    active: true,
    node: null,
    exit: mockExitCall,
    enter: jest.fn(),
    fullscreenParticipantID: '',
    setRootElement: jest.fn(),
    rootElement: null,
    setHasActiveOverlay: jest.fn(),
  }),
}));

jest.mock('@livekit/components-react', () => ({
  ParticipantContext: {
    Provider: ({ children }: PropsWithChildren) => {
      return <div>{children}</div>;
    },
  },
  useRoomContext: () => jest.fn(),
}));

jest.mock('../LocalVideo', () => ({
  __esModule: true,
  default: () => <div />,
}));

jest.mock('../ParticipantWindow', () => ({
  __esModule: true,
  default: () => <div />,
}));

jest.mock('../Toolbar', () => ({
  __esModule: true,
  default: () => <div data-testid="toolbar"></div>,
}));

describe('FullscreenView', () => {
  afterEach(() => cleanup());
  const { store } = configureStore();

  it('renders without crashing', () => {
    renderWithProviders(<FullscreenView />, { store });

    expect(screen.getByTestId('fullscreen')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /indicator-fullscreen-close/i })).toBeInTheDocument();
    expect(screen.queryByTestId('fullscreenLocalVideo')).not.toBeInTheDocument();
    expect(screen.queryByTestId('Toolbar')).not.toBeInTheDocument();
  });

  it('shows LocalVideo & toolbar on mouse over', () => {
    renderWithProviders(<FullscreenView />, { store });
    const fullscreen = screen.getByTestId('fullscreen');
    expect(fullscreen).toBeInTheDocument();

    fireEvent.mouseMove(fullscreen);

    expect(screen.getByRole('button', { name: /indicator-fullscreen-close/i })).toBeInTheDocument();
    expect(screen.getByTestId('toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('fullscreenLocalVideo')).toBeInTheDocument();
  });

  it('triggers react-full-screen exit function when clicking on close button', () => {
    renderWithProviders(<FullscreenView />, { store });

    const closeBtn = screen.getByRole('button', { name: /indicator-fullscreen-close/i });
    expect(screen.getByTestId('fullscreen')).toBeInTheDocument();
    expect(closeBtn).toBeInTheDocument();

    fireEvent.click(closeBtn);

    expect(mockExitCall).toHaveBeenCalled();
  });
});
