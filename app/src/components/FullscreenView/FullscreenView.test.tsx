// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, screen } from '@testing-library/react';
import { PropsWithChildren } from 'react';

import { fullscreenActions } from '../../store/slices/fullscreen/slice';
import { configureStore, mockedParticipant, renderWithProviders } from '../../utils/testUtils';
import FullscreenView from './FullscreenView';

vi.mock('@livekit/components-react', () => ({
  ParticipantContext: {
    Provider: ({ children }: PropsWithChildren) => {
      return <div>{children}</div>;
    },
  },
  useRoomContext: () => vi.fn(),
  useRemoteParticipant: () => mockedParticipant(0),
  useRemoteParticipants: () => [mockedParticipant(0)],
}));

vi.mock('../LocalVideo', () => ({
  __esModule: true,
  default: () => <div />,
}));

vi.mock('../ParticipantWindow', () => ({
  __esModule: true,
  default: () => <div />,
}));

vi.mock('../Toolbar', () => ({
  __esModule: true,
  default: () => <div data-testid="toolbar"></div>,
}));

describe('FullscreenView', () => {
  const { store } = configureStore();

  it('renders without crashing', () => {
    renderWithProviders(<FullscreenView />, { store, provider: { mui: true } });

    expect(screen.getByTestId('fullscreen')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /indicator-fullscreen-close/i })).toBeInTheDocument();
    expect(screen.queryByTestId('fullscreenLocalVideo')).not.toBeInTheDocument();
    expect(screen.queryByTestId('Toolbar')).not.toBeInTheDocument();
  });

  it('shows LocalVideo & toolbar on mouse over', () => {
    renderWithProviders(<FullscreenView />, { store, provider: { mui: true } });
    const fullscreen = screen.getByTestId('fullscreen');
    expect(fullscreen).toBeInTheDocument();

    fireEvent.mouseMove(fullscreen);

    expect(screen.getByRole('button', { name: /indicator-fullscreen-close/i })).toBeInTheDocument();
    expect(screen.getByTestId('toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('fullscreenLocalVideo')).toBeInTheDocument();
  });

  it('triggers react-full-screen exit function when clicking on close button', () => {
    renderWithProviders(<FullscreenView />, { store, provider: { mui: true } });

    const spyFullscreenActionsExit = vi.spyOn(fullscreenActions, 'exit');
    const closeBtn = screen.getByRole('button', { name: /indicator-fullscreen-close/i });

    expect(screen.getByTestId('fullscreen')).toBeInTheDocument();
    expect(closeBtn).toBeInTheDocument();

    fireEvent.click(closeBtn);

    expect(spyFullscreenActionsExit).toHaveBeenCalled();
  });
});
