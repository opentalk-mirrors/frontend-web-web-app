// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { createMockEvent } from '../../../utils/eventTestUtils';
import { configureStore, render, screen } from '../../../utils/testUtils';
import Home from './Home';

const useGetEventsQuery = () => {
  return {
    isLoading: false,
    data: {
      data: [createMockEvent(), createMockEvent(), createMockEvent(), createMockEvent()],
    },
  };
};

jest.mock('../../../api/rest', () => ({
  ...jest.requireActual('../../../api/rest'),
  useGetEventsQuery,
  useGetMeQuery: () => ({
    data: {
      displayName: 'Display Name',
    },
  }),
}));

jest.mock('../../../hooks/useHeader', () => ({
  useHeader: () => ({
    setHeader: jest.fn(),
  }),
}));

describe('Dashboard HomePage', () => {
  test('page will not crash', async () => {
    const { store } = configureStore();
    await render(<Home />, store);

    expect(screen.getByText('dashboard-meeting-card-title-next-meetings')).toBeInTheDocument();
  });

  test('it will render 4 upcoming events', async () => {
    const { store } = configureStore();
    await render(<Home />, store);

    expect(screen.getAllByText('dashboard-home-created-by')).toHaveLength(4);
  });

  // documented out because MUI <Hidden> will not working well with jest in v5
  xtest('new meeting button is rendered', async () => {
    const { store } = configureStore();
    await render(<Home />, store);

    expect(screen.getByText('dashboard-meeting-card-button-new-meeting')).toBeInTheDocument();
  });
});
