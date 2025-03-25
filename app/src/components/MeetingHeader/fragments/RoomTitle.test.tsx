// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { truncate } from 'lodash';

import { renderWithProviders, configureStore } from '../../../utils/testUtils';
import RoomTitle from './RoomTitle';
import { ROOM_TITLE_MAX_LENGTH } from './constants';

describe('Room title', () => {
  test('should display the whole name in the title and in the tooltip', async () => {
    const allowedLengthName = 'a'.repeat(ROOM_TITLE_MAX_LENGTH);
    const { store } = configureStore({
      initialState: {
        room: {
          eventInfo: {
            title: allowedLengthName,
          },
        },
      },
    });

    renderWithProviders(<RoomTitle />, { store });

    expect(screen.getByText(allowedLengthName)).toBeInTheDocument();

    const title = screen.getByTitle(allowedLengthName);

    await userEvent.hover(title);

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveTextContent(allowedLengthName);
    });
  });

  test('should display dots after exceeding max length in the title and whole name in the tooltip', async () => {
    const exceedingMaxLengthName = 'a'.repeat(ROOM_TITLE_MAX_LENGTH + 1);
    const { store } = configureStore({
      initialState: {
        room: {
          eventInfo: {
            title: exceedingMaxLengthName,
          },
        },
      },
    });

    renderWithProviders(<RoomTitle />, { store });

    expect(screen.queryByText(exceedingMaxLengthName)).not.toBeInTheDocument();
    expect(screen.getByText(/.../i)).toBeInTheDocument();

    const title = screen.getByTitle(exceedingMaxLengthName);

    await userEvent.hover(title);

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveTextContent(exceedingMaxLengthName);
    });
  });
  test('should render the info button if the eventInfo contains meeting details and if the room has roomInfo', () => {
    const { store } = configureStore({
      initialState: {
        room: {
          eventInfo: {
            title: 'some title',
            meetingDetails: {
              inviteCode: 'invite this',
              streamingLinks: [
                {
                  name: 'twitch',
                  url: 'http://twitch.tv/some-streamer',
                },
              ],
              callIn: {
                id: '1138',
                tel: '4815162342',
                password: 'password',
              },
            },
          },
          roomInfo: {
            id: '2320891fsd',
            password: '1234',
            createdBy: {
              firstname: 'Jan',
              lastname: 'Janssen',
              displayName: 'Awesome Jan',
              title: 'Doctor',
              avatarUrl: '',
            },
          },
        },
      },
    });
    renderWithProviders(<RoomTitle />, { store });
    const InfoButton = screen.getByRole('button', { name: 'room-title-info-button-aria-label' });
    expect(InfoButton).toBeVisible();
  });

  test('should display fallback title in case room title is undefined', async () => {
    const truncatedFallbackTitle = truncate('fallback-room-title', { length: ROOM_TITLE_MAX_LENGTH });
    const { store } = configureStore({
      initialState: {
        room: {
          eventInfo: undefined,
        },
      },
    });
    renderWithProviders(<RoomTitle />, { store });

    expect(screen.getByText(truncatedFallbackTitle)).toBeInTheDocument();

    const title = screen.getByTitle('fallback-room-title');

    await userEvent.hover(title);

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveTextContent('fallback-room-title');
    });
  });
  test('should be rendered inside an h1 tag', () => {
    const truncatedFallbackTitle = truncate('fallback-room-title', { length: ROOM_TITLE_MAX_LENGTH });
    const { store } = configureStore({
      initialState: {
        room: {
          eventInfo: undefined,
        },
      },
    });
    renderWithProviders(<RoomTitle />, { store });

    const roomTitleElement = screen.getByText(truncatedFallbackTitle);
    expect(roomTitleElement.tagName).toBe('H1');
  });
});
