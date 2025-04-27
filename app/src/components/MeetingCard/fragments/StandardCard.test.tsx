// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Event } from '@opentalk/rest-api-rtk-query';
import { screen, fireEvent, waitFor } from '@testing-library/react';

import { renderWithProviders, eventMockedData, configureStore } from '../../../utils/testUtils';
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
  const { store } = configureStore();

  it('render component without crashing', () => {
    renderWithProviders(<StandardCard {...dummyMeetingCardData} />, { store, provider: { router: true } });

    expect(screen.getByRole('link', { name: 'dashboard-home-join-label' })).toBeInTheDocument();
    expect(screen.getByLabelText('toolbar-button-more-tooltip-title')).toBeInTheDocument();
    expect(screen.getByTestId('favorite-icon-visible')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'global-favorite' })).toBeInTheDocument();
  });

  it('card is not marked as favorite with flag favorite={false}, svg fav should not be in document', () => {
    renderWithProviders(
      <StandardCard {...dummyMeetingCardData} event={{ ...dummyMeetingCardData.event, isFavorite: false }} />,
      { store, provider: { router: true } }
    );

    expect(screen.queryByTestId('favorite-icon-visible')).not.toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'global-favorite' })).not.toBeInTheDocument();
  });

  it('click on more menu should display popup with edit, fav and delete option for meeting creator', async () => {
    renderWithProviders(<StandardCard {...dummyMeetingCardData} />, { store, provider: { router: true } });
    const MoreMenu = screen.getByRole('button', { name: 'toolbar-button-more-tooltip-title' });

    expect(MoreMenu).toBeInTheDocument();

    fireEvent.mouseDown(MoreMenu);

    await waitFor(() => {
      expect(screen.getByLabelText('dashboard-meeting-card-popover-update-label')).toBeInTheDocument();
      expect(screen.getByLabelText('dashboard-meeting-card-popover-remove-label')).toBeInTheDocument();
      expect(screen.queryByLabelText('dashboard-meeting-card-popover-add-label')).not.toBeInTheDocument();
      expect(screen.getByLabelText('dashboard-meeting-card-popover-delete-label')).toBeInTheDocument();
    });
  });

  it('when user is not creator, meeting is marked as fav, click on more menu should display popup with remove favorite option', async () => {
    renderWithProviders(<StandardCard {...dummyMeetingCardData} isMeetingCreator={false} />, {
      store,
      provider: { router: true },
    });
    const MoreMenu = screen.getByRole('button', { name: 'toolbar-button-more-tooltip-title' });
    expect(MoreMenu).toBeInTheDocument();

    fireEvent.mouseDown(MoreMenu);

    await waitFor(() => {
      expect(screen.getByLabelText('dashboard-meeting-card-popover-remove-label')).toBeInTheDocument();
      expect(screen.queryByLabelText('dashboard-meeting-card-popover-add-label')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('dashboard-meeting-card-popover-update-label')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('dashboard-meeting-card-popover-delete-label')).not.toBeInTheDocument();
    });
  });

  it('when user is not creator, meeting is not marked as fav, click on more menu should display popup with add favorite option', async () => {
    renderWithProviders(
      <StandardCard
        {...dummyMeetingCardData}
        event={{ ...dummyMeetingCardData.event, isFavorite: false }}
        isMeetingCreator={false}
      />,
      { store, provider: { router: true } }
    );
    const MoreMenu = screen.getByRole('button', { name: 'toolbar-button-more-tooltip-title' });
    expect(MoreMenu).toBeInTheDocument();

    fireEvent.mouseDown(MoreMenu);

    await waitFor(() => {
      expect(screen.getByLabelText('dashboard-meeting-card-popover-add-label')).toBeInTheDocument();
      expect(screen.queryByLabelText('dashboard-meeting-card-popover-remove-label')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('dashboard-meeting-card-popover-update-label')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('dashboard-meeting-card-popover-delete-label')).not.toBeInTheDocument();
    });
  });
});
