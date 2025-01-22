// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen, fireEvent, waitFor, mockStore } from '../../utils/testUtils';
import TalkingStickTabPanel from './TalkingStickTabPanel';

const NUMBER_OF_PARTICIPANTS = 2;
describe('<TalkingStickTabPanel />', () => {
  describe('automod inactive', () => {
    const { store } = mockStore(NUMBER_OF_PARTICIPANTS, { video: true, screen: true });

    it('should render start button', async () => {
      await render(<TalkingStickTabPanel />, store);

      const startButton = screen.queryByRole('button', { name: 'global-start-now' });
      expect(startButton).toBeInTheDocument();
    });
    it('should render include moderator checkbox, which is set by default', async () => {
      await render(<TalkingStickTabPanel />, store);

      const includeModerator = screen.getByRole('checkbox', { name: 'talking-stick-include-moderator-switch' });
      expect(includeModerator).toHaveAttribute('value', 'true');
    });
    it('should unset include moderator checkbox, on user click ', async () => {
      await render(<TalkingStickTabPanel />, store);

      const includeModerator = screen.getByRole('checkbox', { name: 'talking-stick-include-moderator-switch' });
      fireEvent.click(includeModerator);
      await waitFor(() => {
        expect(includeModerator).toHaveAttribute('value', 'false');
      });
    });
    it('should not render skip speaker and stop button', async () => {
      await render(<TalkingStickTabPanel />, store);

      const skipSpeakerButton = screen.queryByRole('button', { name: 'talking-stick-skip-speaker' });
      const stopButton = screen.queryByRole('button', { name: 'global-stop' });

      expect(skipSpeakerButton).not.toBeInTheDocument();
      expect(stopButton).not.toBeInTheDocument();
    });
  });
  describe('automod active', () => {
    const { store } = mockStore(NUMBER_OF_PARTICIPANTS, {
      video: true,
      screen: true,
      automodActive: true,
    });

    it('should not render start button and include moderator checkbox', async () => {
      await render(<TalkingStickTabPanel />, store);

      const startButton = screen.queryByRole('button', { name: 'global-start-now' });
      expect(startButton).not.toBeInTheDocument();

      const includeModerator = screen.queryByRole('checkbox', { name: 'talking-stick-include-moderator-switch' });
      expect(includeModerator).not.toBeInTheDocument();
    });
    it('should render skip speaker and stop button', async () => {
      await render(<TalkingStickTabPanel />, store);

      const skipSpeakerButton = screen.queryByRole('button', { name: 'talking-stick-skip-speaker' });
      const stopButton = screen.queryByRole('button', { name: 'global-stop' });

      expect(skipSpeakerButton).toBeInTheDocument();
      expect(stopButton).toBeInTheDocument();
    });
  });
});
