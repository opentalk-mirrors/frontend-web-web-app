// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { PropsWithChildren } from 'react';

import { render, screen, mockStore, mockedParticipant } from '../../utils/testUtils';
import GridView from './GridView';

jest.mock('./fragments/GridCell', () => ({
  __esModule: true,
  default: () => <div data-testid="gridCell"></div>,
}));

jest.mock('@livekit/components-react', () => ({
  ParticipantContext: {
    Provider: ({ children }: PropsWithChildren) => {
      return <div data-testid="provider"> {children}</div>;
    },
  },
  useRoomContext: () => jest.fn(),
  useRemoteParticipants: () => [mockedParticipant(0)],
}));

describe('GridView', () => {
  test('render GridView', async () => {
    const { store } = mockStore(0);
    await render(<GridView />, store);
    expect(screen.getByTestId('grid-container')).toBeVisible();
  });
});
