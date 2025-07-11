// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, screen } from '@testing-library/react';

import { idFromDescriptor } from '../../../modules/WebRTC';
import { PresenterVideoPosition } from '../../../store/slices/uiSlice';
import {
  mockStore,
  mockedParticipant,
  mockedVideoMediaDescriptor,
  renderWithProviders,
} from '../../../utils/testUtils';
import ScreenPresenterVideo from './ScreenPresenterVideo';

vi.mock('@livekit/components-react', () => ({
  useParticipantContext: () => mockedParticipant(0),
  useRoomContext: () => vi.fn(),
  useRemoteParticipant: () => mockedParticipant(0),
}));

vi.mock('./RemoteVideo', () => ({
  __esModule: true,
  default: () => <div data-testid="remoteVideo" />,
}));

const participant = mockedParticipant(0);
const participantId = participant.participantId;

const ScreenPresenterVideoProps = {
  participantId: participantId,
  isFullscreenMode: false,
  isVideoPinned: false,
  videoPosition: 'bottomRight' as PresenterVideoPosition,
  togglePin: vi.fn(),
  changeVideoPosition: vi.fn(),
};

describe('ScreenPresenterVideo Component', () => {
  const handleClick = vi.fn();
  const { store } = mockStore(1);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('render component without crashing', () => {
    renderWithProviders(<ScreenPresenterVideo {...ScreenPresenterVideoProps} />, { store, provider: { mui: true } });

    expect(screen.getByTestId('sharedPresenterVideo')).toBeInTheDocument();

    expect(screen.getByTestId('participantAvatar')).toBeInTheDocument();
    expect(screen.queryByText(participant.displayName)).not.toBeInTheDocument();
    expect(screen.queryByTestId('screenShareVideoOverlay')).not.toBeInTheDocument();
  });

  it("mouse over presenter's video should display presenter's overlay", () => {
    renderWithProviders(<ScreenPresenterVideo {...ScreenPresenterVideoProps} />, { store, provider: { mui: true } });
    const screenShareVideo = screen.getByTestId('sharedPresenterVideo');

    expect(screenShareVideo).toBeInTheDocument();
    expect(screen.queryByTestId('screenShareVideoOverlay')).not.toBeInTheDocument();

    fireEvent.mouseEnter(screenShareVideo);

    expect(screen.getByLabelText('indicator-pinned')).toBeInTheDocument();
    expect(screen.getByLabelText('indicator-change-position')).toBeInTheDocument();
    expect(screen.getByTestId('screenShareVideoOverlay')).toBeInTheDocument();
  });

  it("click on pinIcon in presenter's overlay should trigger togglePinVideo()", () => {
    renderWithProviders(<ScreenPresenterVideo {...ScreenPresenterVideoProps} togglePin={handleClick} />, {
      store,
      provider: { mui: true },
    });
    const screenShareVideo = screen.getByTestId('sharedPresenterVideo');

    expect(screenShareVideo).toBeInTheDocument();
    expect(screen.queryByTestId('screenShareVideoOverlay')).not.toBeInTheDocument();

    fireEvent.mouseEnter(screenShareVideo);

    expect(screen.getByTestId('screenShareVideoOverlay')).toBeInTheDocument();

    const pinButton = screen.getByRole('button', { name: /indicator-pinned/i });
    expect(pinButton).toBeInTheDocument();

    fireEvent.click(pinButton);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("click on change position icon in presenter's overlay should trigger changeVideoPosition()", () => {
    renderWithProviders(<ScreenPresenterVideo {...ScreenPresenterVideoProps} changeVideoPosition={handleClick} />, {
      store,
      provider: { mui: true },
    });
    const screenShareVideo = screen.getByTestId('sharedPresenterVideo');

    expect(screenShareVideo).toBeInTheDocument();
    expect(screen.queryByTestId('screenShareVideoOverlay')).not.toBeInTheDocument();

    fireEvent.mouseEnter(screenShareVideo);

    expect(screen.getByTestId('screenShareVideoOverlay')).toBeInTheDocument();

    const button = screen.getByRole('button', {
      name: /indicator-change-position/i,
    });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("render component with presenter's video off should display avatar component", () => {
    const { store } = mockStore(1);
    renderWithProviders(<ScreenPresenterVideo {...ScreenPresenterVideoProps} />, { store, provider: { mui: true } });

    expect(screen.getByTestId('sharedPresenterVideo')).toBeInTheDocument();
    expect(screen.getByTestId('participantAvatar')).toBeInTheDocument();
    expect(screen.queryByText(participant.displayName)).not.toBeInTheDocument();
    expect(screen.queryByTestId('screenShareVideoOverlay')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`remoteVideo-${idFromDescriptor(mockedVideoMediaDescriptor(0))}`)
    ).not.toBeInTheDocument();
  });
});
