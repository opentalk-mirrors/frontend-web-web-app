// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import { PropsWithChildren } from 'react';

import { renderWithProviders, mockStore, mockedParticipant } from '../../utils/testUtils';
import GridView from './GridView';

jest.mock('./fragments/GridCell', () => ({
  __esModule: true,
  default: () => <div data-testid="gridCell"></div>,
}));

jest.mock('@livekit/components-react', () => ({
  ParticipantContext: {
    Provider: ({ children }: PropsWithChildren) => {
      return <div>{children}</div>;
    },
  },
  useRoomContext: () => jest.fn(),
  useRemoteParticipants: () => [mockedParticipant(0)],
}));

describe('GridView', () => {
  it('render GridView', () => {
    const { store } = mockStore(1);
    renderWithProviders(<GridView />, { store });

    expect(screen.getByTestId('gridCell')).toBeVisible();
  });
});
