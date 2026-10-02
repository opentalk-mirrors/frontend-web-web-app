// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, screen } from '@testing-library/react';
import { PropsWithChildren } from 'react';
import { Mock } from 'vitest';

import useConferenceUiVersion from '../../hooks/useConferenceUiVersion';
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
  useSortedParticipants: () => [mockedParticipant(0)],
}));

vi.mock('../../hooks/useConferenceUiVersion', () => ({
  __esModule: true,
  default: vi.fn(),
}));

vi.mock('../LocalVideoLegacy', () => ({
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
    (useConferenceUiVersion as Mock).mockReturnValue({ isV2: true });
    renderWithProviders(<FullscreenView />, { store, provider: { mui: true } });

    expect(screen.getByTestId('fullscreen')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /global-fullscreen-close/i })).toBeInTheDocument();
    expect(screen.queryByTestId('fullscreenLocalVideo')).not.toBeInTheDocument();
    expect(screen.queryByTestId('Toolbar')).not.toBeInTheDocument();
  });

  it('shows toolbar on mouse over', () => {
    (useConferenceUiVersion as Mock).mockReturnValue({ isV2: true });
    renderWithProviders(<FullscreenView />, { store, provider: { mui: true } });

    const fullscreen = screen.getByTestId('fullscreen');
    expect(fullscreen).toBeInTheDocument();

    fireEvent.mouseMove(fullscreen);

    expect(screen.getByRole('button', { name: /global-fullscreen-close/i })).toBeInTheDocument();
    expect(screen.getByTestId('toolbar')).toBeInTheDocument();
  });

  it('doesnt show LocalVideo on mouse over if V2 ui is selected', () => {
    (useConferenceUiVersion as Mock).mockReturnValue({ isV2: true });
    renderWithProviders(<FullscreenView />, { store, provider: { mui: true } });

    const fullscreen = screen.getByTestId('fullscreen');
    expect(fullscreen).toBeInTheDocument();

    fireEvent.mouseMove(fullscreen);

    expect(screen.queryByTestId('fullscreenLocalVideo')).not.toBeInTheDocument();
  });

  it('shows LocalVideo on mouse over if V1 ui is selected', () => {
    (useConferenceUiVersion as Mock).mockReturnValue({ isV2: false });
    renderWithProviders(<FullscreenView />, { store, provider: { mui: true } });

    const fullscreen = screen.getByTestId('fullscreen');
    expect(fullscreen).toBeInTheDocument();

    fireEvent.mouseMove(fullscreen);

    expect(screen.getByTestId('fullscreenLocalVideo')).toBeInTheDocument();
  });

  it('triggers react-full-screen exit function when clicking on close button', () => {
    (useConferenceUiVersion as Mock).mockReturnValue({ isV2: true });
    renderWithProviders(<FullscreenView />, { store, provider: { mui: true } });

    const spyFullscreenActionsExit = vi.spyOn(fullscreenActions, 'exit');
    const closeBtn = screen.getByRole('button', { name: /global-fullscreen-close/i });

    expect(screen.getByTestId('fullscreen')).toBeInTheDocument();
    expect(closeBtn).toBeInTheDocument();

    fireEvent.click(closeBtn);

    expect(spyFullscreenActionsExit).toHaveBeenCalled();
  });
});
