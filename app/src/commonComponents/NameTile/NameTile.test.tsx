// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ParticipantId } from '../../types';
import { screen, configureStore, mockedParticipant, render, cleanup } from '../../utils/testUtils';
import NameTile from './NameTile';

jest.mock('@livekit/components-react', () => ({
  useParticipants: () => [mockedParticipant(0)],
  useRoomContext: () => jest.fn(),
}));

jest.mock('../../provider/MediaChoicesProvider', () => ({
  usePersistentUserChoices: () => jest.fn(),
}));

describe('render <NameTile />', () => {
  const participant = mockedParticipant(0);
  const displayName = participant.displayName;
  const participantId = participant.id as ParticipantId;
  beforeEach(() => cleanup());

  test('render NameTile component with audio on', async () => {
    const { store } = configureStore();
    await render(<NameTile displayName={displayName} participantId={participantId} />, store);

    expect(screen.getByTestId('nameTile')).toBeInTheDocument();
    expect(screen.getByText(displayName)).toBeInTheDocument();
    expect(screen.getByTestId('micOff')).toBeInTheDocument();
  });

  test('render NameTile component with audio off', async () => {
    const { store } = configureStore();
    await render(<NameTile displayName={displayName} participantId={participantId} />, store);

    expect(screen.getByTestId('nameTile')).toBeInTheDocument();
    expect(screen.getByText(displayName)).toBeInTheDocument();
    expect(screen.getByTestId('micOff')).toBeInTheDocument();
  });

  test('render NameTile component with video on', async () => {
    const { store } = configureStore();
    await render(<NameTile displayName={displayName} participantId={participantId} />, store);

    expect(screen.getByTestId('nameTile')).toBeInTheDocument();
    expect(screen.getByText(displayName)).toBeInTheDocument();
    expect(screen.queryByTestId('camOff')).toBeInTheDocument();
  });

  test('render NameTile component with video and audio on', async () => {
    const { store } = configureStore();
    await render(<NameTile displayName={displayName} participantId={participantId} />, store);

    expect(screen.getByTestId('nameTile')).toBeInTheDocument();
    expect(screen.getByText(displayName)).toBeInTheDocument();
    expect(screen.queryByTestId('iconBox')).toBeInTheDocument();
  });

  test('render NameTile component with local video on', async () => {
    const { store } = configureStore();
    console.log(store.getState());
    await render(<NameTile localVideoOn localAudioOn={false} displayName={displayName} />, store);

    expect(screen.getByTestId('nameTile')).toBeInTheDocument();
    expect(screen.getByText(displayName)).toBeInTheDocument();
    expect(screen.queryByTestId('micOff')).toBeInTheDocument();
    expect(screen.queryByTestId('camOff')).not.toBeInTheDocument();
  });

  test('render NameTile component with local audio on', async () => {
    const { store } = configureStore();
    await render(<NameTile localAudioOn localVideoOn={false} displayName={displayName} />, store);

    expect(screen.getByTestId('nameTile')).toBeInTheDocument();
    expect(screen.getByText(displayName)).toBeInTheDocument();
    expect(screen.queryByTestId('micOff')).not.toBeInTheDocument();
    expect(screen.queryByTestId('camOff')).toBeInTheDocument();
  });

  test('render NameTile component with local video and audio on', async () => {
    const { store } = configureStore();
    await render(<NameTile localVideoOn localAudioOn displayName={displayName} />, store);

    expect(screen.getByTestId('nameTile')).toBeInTheDocument();
    expect(screen.getByText(displayName)).toBeInTheDocument();
    expect(screen.queryByTestId('micOff')).not.toBeInTheDocument();
    expect(screen.queryByTestId('camOff')).not.toBeInTheDocument();
  });
});
