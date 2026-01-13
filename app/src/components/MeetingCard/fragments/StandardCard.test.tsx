// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Event } from '@opentalk/rest-api-rtk-query';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders, eventMockedData, configureStore } from '../../../utils/testUtils';
import StandardCard from './StandardCard';

const dummyMeetingCardData = {
  event: eventMockedData as Event,
  highlighted: false,
  isMeetingCreator: true,
};

vi.mock('../../../api/rest', async (importOriginal) => ({
  ...(await importOriginal()),
  useMarkFavoriteEventMutation: () => [
    vi.fn(),
    {
      isLoading: false,
    },
  ],
  useUnmarkFavoriteEventMutation: () => [
    vi.fn(),
    {
      isLoading: false,
    },
  ],
  useDeleteEventMutation: () => [
    vi.fn(),
    {
      isLoading: false,
    },
  ],
  useDeclineEventInviteMutation: () => [
    vi.fn(),
    {
      isLoading: false,
    },
  ],
  useGetMeQuery: () => ({
    data: {
      id: '3645d74d-9a4b-4cd4-9d9f-f1871c970167',
    },
  }),
  useGetRoomTariffQuery: () => ({
    data: {
      modules: {
        core: {
          features: ['guests_allowed'],
        },
      },
    },
  }),
}));

describe('Standard Card', () => {
  const { store } = configureStore();

  it('render component without crashing', () => {
    renderWithProviders(<StandardCard {...dummyMeetingCardData} />, { store, provider: { router: true, mui: true } });

    expect(screen.getByRole('link', { name: 'dashboard-home-join-label' })).toBeInTheDocument();
    expect(screen.getByLabelText('toolbar-button-more-tooltip-title')).toBeInTheDocument();
    expect(screen.getByTestId('favorite-icon-visible')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'global-favorite' })).toBeInTheDocument();
  });

  it('card is not marked as favorite with flag favorite={false}, svg fav should not be in document', () => {
    renderWithProviders(
      <StandardCard {...dummyMeetingCardData} event={{ ...dummyMeetingCardData.event, isFavorite: false }} />,
      { store, provider: { router: true, mui: true } }
    );

    expect(screen.queryByTestId('favorite-icon-visible')).not.toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'global-favorite' })).not.toBeInTheDocument();
  });

  it('click on more menu should display popup with edit, fav and delete option for meeting creator', async () => {
    const user = userEvent.setup();
    renderWithProviders(<StandardCard {...dummyMeetingCardData} />, { store, provider: { router: true, mui: true } });
    const MoreMenu = screen.getByRole('button', { name: 'toolbar-button-more-tooltip-title' });

    await user.click(MoreMenu);

    expect(screen.getByLabelText('dashboard-meeting-card-popover-update-label')).toBeInTheDocument();
    expect(screen.getByLabelText('dashboard-meeting-card-popover-remove-label')).toBeInTheDocument();
    expect(screen.queryByLabelText('dashboard-meeting-card-popover-add-label')).not.toBeInTheDocument();
    expect(screen.getByLabelText('dashboard-meeting-card-popover-delete-label')).toBeInTheDocument();
  });

  it('when user is not creator, meeting is marked as fav, click on more menu should display popup with remove favorite option', async () => {
    const user = userEvent.setup();
    renderWithProviders(<StandardCard {...dummyMeetingCardData} isMeetingCreator={false} />, {
      store,
      provider: { router: true, mui: true },
    });
    const MoreMenu = screen.getByRole('button', { name: 'toolbar-button-more-tooltip-title' });

    await user.click(MoreMenu);

    expect(screen.getByLabelText('dashboard-meeting-card-popover-remove-label')).toBeInTheDocument();
    expect(screen.queryByLabelText('dashboard-meeting-card-popover-add-label')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('dashboard-meeting-card-popover-update-label')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('dashboard-meeting-card-popover-delete-label')).not.toBeInTheDocument();
  });

  it('when user is not creator, meeting is not marked as fav, click on more menu should display popup with add favorite option', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <StandardCard
        {...dummyMeetingCardData}
        event={{ ...dummyMeetingCardData.event, isFavorite: false }}
        isMeetingCreator={false}
      />,
      { store, provider: { router: true, mui: true } }
    );
    const MoreMenu = screen.getByRole('button', { name: 'toolbar-button-more-tooltip-title' });

    await user.click(MoreMenu);

    expect(screen.getByLabelText('dashboard-meeting-card-popover-add-label')).toBeInTheDocument();
    expect(screen.queryByLabelText('dashboard-meeting-card-popover-remove-label')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('dashboard-meeting-card-popover-update-label')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('dashboard-meeting-card-popover-delete-label')).not.toBeInTheDocument();
  });
});
