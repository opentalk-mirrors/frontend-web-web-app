// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, fireEvent } from '@testing-library/react';
import { PropsWithChildren } from 'react';

import { renderWithProviders, mockStore } from '../../utils/testUtils';
import TalkingStickTabPanel from './TalkingStickTabPanel';

jest.mock('../TalkingStickParticipantList/fragments/ParticipantListItem/ParticipantListItem', () => ({
  __esModule: true,
  default: ({ children }: PropsWithChildren) => {
    return <div>{children}</div>;
  },
}));

const NUMBER_OF_PARTICIPANTS = 2;
describe('<TalkingStickTabPanel />', () => {
  describe('automod inactive', () => {
    const { store } = mockStore(NUMBER_OF_PARTICIPANTS, { video: true, screen: true });

    test('should render start button', () => {
      renderWithProviders(<TalkingStickTabPanel />, { store, provider: { mui: true } });

      const startButton = screen.queryByRole('button', { name: 'global-start-now' });
      expect(startButton).toBeInTheDocument();
    });
    test('should render include moderator checkbox, which is set by default', () => {
      renderWithProviders(<TalkingStickTabPanel />, { store, provider: { mui: true } });

      const includeModerator = screen.getByRole('checkbox', { name: 'talking-stick-include-moderator-switch' });
      expect(includeModerator).toHaveAttribute('value', 'true');
    });
    test('should unset include moderator checkbox, on user click ', () => {
      renderWithProviders(<TalkingStickTabPanel />, { store, provider: { mui: true } });

      const includeModerator = screen.getByRole('checkbox', { name: 'talking-stick-include-moderator-switch' });

      fireEvent.click(includeModerator);

      expect(includeModerator).toHaveAttribute('value', 'false');
    });
    test('should not render skip speaker and stop button', () => {
      renderWithProviders(<TalkingStickTabPanel />, { store, provider: { mui: true } });

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

    test('should not render start button and include moderator checkbox', () => {
      renderWithProviders(<TalkingStickTabPanel />, { store });

      const startButton = screen.queryByRole('button', { name: 'global-start-now' });
      expect(startButton).not.toBeInTheDocument();

      const includeModerator = screen.queryByRole('checkbox', { name: 'talking-stick-include-moderator-switch' });
      expect(includeModerator).not.toBeInTheDocument();
    });
    test('should render skip speaker and stop button', () => {
      renderWithProviders(<TalkingStickTabPanel />, { store });

      const skipSpeakerButton = screen.queryByRole('button', { name: 'talking-stick-skip-speaker' });
      const stopButton = screen.queryByRole('button', { name: 'global-stop' });

      expect(skipSpeakerButton).toBeInTheDocument();
      expect(stopButton).toBeInTheDocument();
    });
  });
});
