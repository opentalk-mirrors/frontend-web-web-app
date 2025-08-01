// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { configureStore, renderWithProviders } from '../../utils/testUtils';
import MeetingNotesView from './MeetingNotesView';

describe('MeetingNotesView', () => {
  it('renders iframe when meetingNotesUrl is present', async () => {
    const { store } = configureStore({
      initialState: {
        meetingNotes: {
          meetingNotesUrl: '/notes',
        },
      },
    });
    renderWithProviders(<MeetingNotesView />, { store });

    const iframe = await screen.findByTitle('moderationbar-button-meeting-notes-tooltip');

    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', '/notes');
  });

  it('renders nothing when meetingNotesUrl is null', () => {
    const { store } = configureStore();
    const { container } = renderWithProviders(<MeetingNotesView />, { store });

    expect(container).toBeEmptyDOMElement();
  });
});
