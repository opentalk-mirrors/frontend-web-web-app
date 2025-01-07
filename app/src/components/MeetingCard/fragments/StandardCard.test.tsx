// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Event } from '@opentalk/rest-api-rtk-query';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import store from '../../../store';
import { screen, render, eventMockedData, fireEvent, waitFor } from '../../../utils/testUtils';
import StandardCard from './StandardCard';

const dummyMeetingCardData = {
  event: eventMockedData as Event,
  highlighted: false,
  isMeetingCreator: true,
};

jest.mock('../../../api/rest', () => ({
  ...jest.requireActual('../../../api/rest'),
  useMarkFavoriteEventMutation: () => [
    jest.fn(),
    {
      isLoading: false,
    },
  ],
  useUnmarkFavoriteEventMutation: () => [
    jest.fn(),
    {
      isLoading: false,
    },
  ],
  useDeleteEventMutation: () => [
    jest.fn(),
    {
      isLoading: false,
    },
  ],
  useDeclineEventInviteMutation: () => [
    jest.fn(),
    {
      isLoading: false,
    },
  ],
  useGetMeQuery: () => ({
    data: {
      id: '3645d74d-9a4b-4cd4-9d9f-f1871c970167',
    },
  }),
}));

describe('Standard Card', () => {
  test('render component without crashing', async () => {
    await render(
      <BrowserRouter>
        <Provider store={store}>
          <StandardCard {...dummyMeetingCardData} />
        </Provider>
      </BrowserRouter>
    );
    expect(screen.getByRole('link', { name: 'dashboard-home-join' })).toBeInTheDocument();
    expect(screen.getByLabelText('global-favorite')).toBeInTheDocument();
    expect(screen.getByLabelText('toolbar-button-more-tooltip-title')).toBeInTheDocument();
    expect(screen.getByTestId('favorite-icon-visible')).toBeInTheDocument();
  });

  test('card is not marked as favorite with flag favorite={false}, svg fav should not be in document', async () => {
    await render(
      <BrowserRouter>
        <Provider store={store}>
          <StandardCard {...dummyMeetingCardData} event={{ ...dummyMeetingCardData.event, isFavorite: false }} />
        </Provider>
      </BrowserRouter>
    );
    expect(screen.queryByTestId('favorite-icon-visible')).not.toBeInTheDocument();
  });

  test('click on more menu should display popup with edit, fav and delete option for meeting creator', async () => {
    await render(
      <BrowserRouter>
        <Provider store={store}>
          <StandardCard {...dummyMeetingCardData} />
        </Provider>
      </BrowserRouter>
    );

    const MoreMenu = screen.getByRole('button', { name: 'toolbar-button-more-tooltip-title' });
    expect(MoreMenu).toBeInTheDocument();
    fireEvent.mouseDown(MoreMenu);

    await waitFor(() => {
      expect(screen.getByLabelText('dashboard-meeting-card-popover-update')).toBeInTheDocument();
      expect(screen.getByLabelText('dashboard-meeting-card-popover-remove')).toBeInTheDocument();
      expect(screen.queryByLabelText('dashboard-meeting-card-popover-add')).not.toBeInTheDocument();
      expect(screen.getByLabelText('dashboard-meeting-card-popover-delete')).toBeInTheDocument();
    });
  });

  test('when user is not creator, meeting is marked as fav, click on more menu should display popup with remove favorite option', async () => {
    await render(
      <BrowserRouter>
        <Provider store={store}>
          <StandardCard {...dummyMeetingCardData} isMeetingCreator={false} />
        </Provider>
      </BrowserRouter>
    );
    const MoreMenu = screen.getByRole('button', { name: 'toolbar-button-more-tooltip-title' });
    expect(MoreMenu).toBeInTheDocument();
    fireEvent.mouseDown(MoreMenu);

    await waitFor(() => {
      expect(screen.getByLabelText('dashboard-meeting-card-popover-remove')).toBeInTheDocument();
      expect(screen.queryByLabelText('dashboard-meeting-card-popover-add')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('dashboard-meeting-card-popover-update')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('dashboard-meeting-card-popover-delete')).not.toBeInTheDocument();
    });
  });

  test('when user is not creator, meeting is not marked as fav, click on more menu should display popup with add favorite option', async () => {
    await render(
      <BrowserRouter>
        <Provider store={store}>
          <StandardCard
            {...dummyMeetingCardData}
            event={{ ...dummyMeetingCardData.event, isFavorite: false }}
            isMeetingCreator={false}
          />
        </Provider>
      </BrowserRouter>
    );
    const MoreMenu = screen.getByRole('button', { name: 'toolbar-button-more-tooltip-title' });
    expect(MoreMenu).toBeInTheDocument();
    fireEvent.mouseDown(MoreMenu);

    await waitFor(() => {
      expect(screen.getByLabelText('dashboard-meeting-card-popover-add')).toBeInTheDocument();
      expect(screen.queryByLabelText('dashboard-meeting-card-popover-remove')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('dashboard-meeting-card-popover-update')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('dashboard-meeting-card-popover-delete')).not.toBeInTheDocument();
    });
  });
});
