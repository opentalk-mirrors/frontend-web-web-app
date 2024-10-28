// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { cleanup, waitFor } from '@testing-library/react';
import { PropsWithChildren } from 'react';

import { render, screen, configureStore, fireEvent } from '../../utils/testUtils';
import FullscreenView from './FullscreenView';

/**
 * By default, jest is hoisting all mock calls to the top, and when
 * declaring outside function with block scope keywords we end up with
 * the error that variable cannot be used before declaration.
 * This is why we have to define exit mock function as var in order to hoist
 * on top of the mock call.
 */
var mockExitCall = jest.fn();

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
      return <div data-testid="buttomContainer"> {children}</div>;
    },
  },
  useRoomContext: () => jest.fn(),
}));

jest.mock('../LocalVideo', () => ({
  __esModule: true,
  default: () => <div data-testid="localVideo"></div>,
}));

jest.mock('../ParticipantWindow', () => ({
  __esModule: true,
  default: () => <div data-testid="participantWindow"></div>,
}));

jest.mock('../Toolbar', () => ({
  __esModule: true,
  default: () => <div data-testid="toolbar"></div>,
}));

describe('FullscreenView', () => {
  afterEach(() => cleanup());
  const { store } = configureStore();

  test('render without crashing', async () => {
    await render(<FullscreenView />, store);

    expect(screen.getByTestId('fullscreen')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /indicator-fullscreen-close/i })).toBeInTheDocument();
    expect(screen.queryByTestId('fullscreenLocalVideo')).not.toBeInTheDocument();
    expect(screen.queryByTestId('Toolbar')).not.toBeInTheDocument();
  });

  test('mouse over, expected to render LocalVideo & toolbar', async () => {
    await render(<FullscreenView />, store);
    const fullscreen = screen.getByTestId('fullscreen');
    expect(fullscreen).toBeInTheDocument();

    await fireEvent.mouseMove(fullscreen);

    expect(screen.getByRole('button', { name: /indicator-fullscreen-close/i })).toBeInTheDocument();
    expect(screen.getByTestId('toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('fullscreenLocalVideo')).toBeInTheDocument();
  });

  test('click on close button should trigger react-full-screen exit function', async () => {
    await render(<FullscreenView />, store);

    const closeBtn = screen.getByRole('button', { name: /indicator-fullscreen-close/i });
    expect(screen.getByTestId('fullscreen')).toBeInTheDocument();
    expect(closeBtn).toBeInTheDocument();

    await fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(mockExitCall).toBeCalled();
    });
  });
});
