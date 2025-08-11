// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, fireEvent } from '@testing-library/react';
import { PropsWithChildren } from 'react';

import { renderWithProviders, mockStore } from '../../utils/testUtils';
import TalkingStickTabPanel from './TalkingStickTabPanel';

vi.mock('../TalkingStickParticipantList/fragments/ParticipantListItem/ParticipantListItem', () => ({
  __esModule: true,
  default: ({ children }: PropsWithChildren) => {
    return <div>{children}</div>;
  },
}));

const NUMBER_OF_PARTICIPANTS = 2;
describe('<TalkingStickTabPanel />', () => {
  describe('automod inactive', () => {
    const { store, dispatchSpy } = mockStore(NUMBER_OF_PARTICIPANTS, { video: true, screen: true });

    it('should render start button', () => {
      renderWithProviders(<TalkingStickTabPanel />, { store, provider: { mui: true } });

      const startButton = screen.getByRole('button', { name: 'global-start-now' });
      expect(startButton).toBeInTheDocument();
    });

    it('should render include moderator checkbox, which is set by default', () => {
      renderWithProviders(<TalkingStickTabPanel />, { store, provider: { mui: true } });

      const includeModerator = screen.getByRole('switch', { name: 'talking-stick-include-moderator-switch' });
      expect(includeModerator).toHaveAttribute('value', 'true');
    });

    it('should unset include moderator checkbox, on user click', () => {
      renderWithProviders(<TalkingStickTabPanel />, { store, provider: { mui: true } });

      const includeModerator = screen.getByRole('switch', { name: 'talking-stick-include-moderator-switch' });

      fireEvent.click(includeModerator);

      expect(includeModerator).toHaveAttribute('value', 'false');
    });

    it('should not render skip speaker and stop button', () => {
      renderWithProviders(<TalkingStickTabPanel />, { store, provider: { mui: true } });

      const skipSpeakerButton = screen.queryByRole('button', { name: 'talking-stick-skip-speaker' });
      const stopButton = screen.queryByRole('button', { name: 'global-stop' });

      expect(skipSpeakerButton).not.toBeInTheDocument();
      expect(stopButton).not.toBeInTheDocument();
    });

    it('should dispatch correct user by click on global-start-now button', () => {
      renderWithProviders(<TalkingStickTabPanel />, { store });

      const startButton = screen.getByRole('button', { name: 'global-start-now' });

      fireEvent.click(startButton);

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith({
        type: 'signaling/automod/start',
        payload: {
          allowDoubleSelection: false,
          animationOnRandom: false,
          autoAppendOnJoin: true,
          considerHandRaise: false,
          playlist: ['00000000-e6b4-4759-000', '00000000-e6b4-4759-001'],
          selectionStrategy: 'playlist',
          showList: true,
        },
      });
    });
  });

  describe('automod active', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    const { store, dispatchSpy } = mockStore(NUMBER_OF_PARTICIPANTS, {
      video: true,
      screen: true,
      automodActive: true,
    });

    it('should not render start button and include moderator checkbox', () => {
      renderWithProviders(<TalkingStickTabPanel />, { store });

      const startButton = screen.queryByRole('button', { name: 'global-start-now' });
      expect(startButton).not.toBeInTheDocument();

      const includeModerator = screen.queryByRole('checkbox', { name: 'talking-stick-include-moderator-switch' });
      expect(includeModerator).not.toBeInTheDocument();
    });

    it('should render skip speaker and stop button', () => {
      renderWithProviders(<TalkingStickTabPanel />, { store });

      const skipSpeakerButton = screen.getByRole('button', { name: 'talking-stick-skip-speaker' });
      const stopButton = screen.getByRole('button', { name: 'global-stop' });

      expect(skipSpeakerButton).toBeInTheDocument();
      expect(stopButton).toBeInTheDocument();
    });

    it('should fire stop action by click stop button', () => {
      renderWithProviders(<TalkingStickTabPanel />, { store });

      const stopButton = screen.getByRole('button', { name: 'global-stop' });

      fireEvent.click(stopButton);

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith({
        type: 'signaling/automod/stop',
        payload: undefined,
      });
    });

    it('should fire skip speaker action by click skip speaker button', () => {
      renderWithProviders(<TalkingStickTabPanel />, { store });

      const skipSpeakerButton = screen.getByRole('button', { name: 'talking-stick-skip-speaker' });

      fireEvent.click(skipSpeakerButton);

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith({
        type: 'signaling/automod/select',
        payload: {
          how: 'next',
        },
      });
    });
  });
});
