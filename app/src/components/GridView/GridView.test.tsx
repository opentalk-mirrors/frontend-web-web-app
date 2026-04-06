// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import { PropsWithChildren } from 'react';

import { renderWithProviders, mockStore, mockedParticipant } from '../../utils/testUtils';
import GridView from './GridView';

vi.mock('./fragments/GridCell', () => ({
  __esModule: true,
  default: () => <div data-testid="gridCell"></div>,
}));

vi.mock('@livekit/components-react', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('@mui/material');

  return {
    ...actual,
    ParticipantContext: {
      Provider: ({ children }: PropsWithChildren) => {
        return <div>{children}</div>;
      },
    },
    useRoomContext: () => vi.fn(),
    useSortedParticipants: vi.fn(() => []),
    useRemoteParticipants: vi.fn(() => [mockedParticipant(0)]),
  };
});

describe('GridView', () => {
  it('render GridView', () => {
    const { store } = mockStore(1);
    renderWithProviders(<GridView />, { store });

    expect(screen.getByTestId('gridCell')).toBeVisible();
  });
});
