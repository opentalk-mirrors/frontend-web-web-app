// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, cleanup } from '@testing-library/react';

import { idFromDescriptor } from '../../../modules/WebRTC';
import { render, screen, mockedParticipant, mockedVideoMediaDescriptor, mockStore } from '../../../utils/testUtils';
import { PresenterVideoPosition } from './PresenterOverlay';
import ScreenPresenterVideo from './ScreenPresenterVideo';

jest.mock('@livekit/components-react', () => ({
  useParticipantContext: () => mockedParticipant(0),
  useRoomContext: () => jest.fn(),
  useRemoteParticipant: () => mockedParticipant(0),
}));

jest.mock('./RemoteVideo', () => ({
  __esModule: true,
  default: () => <div data-testid="remoteVideo"></div>,
}));

const participant = mockedParticipant(0);
const participantId = participant.id;

const ScreenPresenterVideoProps = {
  participantId: participantId,
  isFullscreenMode: false,
  isVideoPinned: false,
  videoPosition: 'bottomRight' as PresenterVideoPosition,
  togglePin: jest.fn(),
  changeVideoPosition: jest.fn(),
};

describe('ScreenPresenterVideo Component', () => {
  const handleClick = jest.fn();
  const { store } = mockStore(1, { video: true, screen: true });
  afterEach(() => cleanup());

  test('render component without crashing', async () => {
    await render(<ScreenPresenterVideo {...ScreenPresenterVideoProps} />, store);

    expect(screen.getByTestId('sharedPresenterVideo')).toBeInTheDocument();

    expect(screen.queryByTestId('participantAvatar')).toBeInTheDocument();
    expect(screen.queryByText(participant.displayName)).not.toBeInTheDocument();
    expect(screen.queryByTestId('screenShareVideoOverlay')).not.toBeInTheDocument();
  });

  test("mouse over presenter's video should display presenter's overlay", async () => {
    await render(<ScreenPresenterVideo {...ScreenPresenterVideoProps} />, store);
    const screenShareVideo = screen.getByTestId('sharedPresenterVideo');

    expect(screenShareVideo).toBeInTheDocument();
    expect(screen.queryByTestId('screenShareVideoOverlay')).not.toBeInTheDocument();

    await fireEvent.mouseEnter(screenShareVideo);
    expect(screen.getByLabelText('indicator-pinned')).toBeInTheDocument();
    expect(screen.getByLabelText('indicator-change-position')).toBeInTheDocument();
    expect(screen.getByTestId('screenShareVideoOverlay')).toBeInTheDocument();
  });

  test("click on pinIcon in presenter's overlay should trigger togglePinVideo()", async () => {
    await render(<ScreenPresenterVideo {...ScreenPresenterVideoProps} togglePin={handleClick} />, store);
    const screenShareVideo = screen.getByTestId('sharedPresenterVideo');

    expect(screenShareVideo).toBeInTheDocument();
    expect(screen.queryByTestId('screenShareVideoOverlay')).not.toBeInTheDocument();

    await fireEvent.mouseEnter(screenShareVideo);
    expect(screen.getByTestId('screenShareVideoOverlay')).toBeInTheDocument();

    const pinButton = screen.getByRole('button', { name: /indicator-pinned/i });
    expect(pinButton).toBeInTheDocument();

    fireEvent.click(pinButton);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("click on change position icon in presenter's overlay should trigger changeVideoPosition()", async () => {
    await render(<ScreenPresenterVideo {...ScreenPresenterVideoProps} changeVideoPosition={handleClick} />, store);
    const screenShareVideo = screen.getByTestId('sharedPresenterVideo');

    expect(screenShareVideo).toBeInTheDocument();
    expect(screen.queryByTestId('screenShareVideoOverlay')).not.toBeInTheDocument();

    await fireEvent.mouseEnter(screenShareVideo);
    expect(screen.getByTestId('screenShareVideoOverlay')).toBeInTheDocument();

    const button = screen.getByRole('button', {
      name: /indicator-change-position/i,
    });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("render component with presenter's video off should display avatar component", async () => {
    const { store } = mockStore(1, { video: false, screen: true });
    await render(<ScreenPresenterVideo {...ScreenPresenterVideoProps} />, store);

    expect(screen.getByTestId('sharedPresenterVideo')).toBeInTheDocument();
    expect(screen.getByTestId('participantAvatar')).toBeInTheDocument();
    expect(screen.queryByText(participant.displayName)).not.toBeInTheDocument();
    expect(screen.queryByTestId('screenShareVideoOverlay')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`remoteVideo-${idFromDescriptor(mockedVideoMediaDescriptor(0))}`)
    ).not.toBeInTheDocument();
  });
});
