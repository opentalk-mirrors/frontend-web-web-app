// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { configureStore, renderWithProviders } from '../../utils/testUtils';
import MeetingNotesView from './MeetingNotesView';

describe('MeetingNotesView', () => {
  it('renders iframe when meetingNotesUrl is present', () => {
    const { store } = configureStore({
      initialState: {
        meetingNotes: {
          meetingNotesUrl: new URL('https://example.com/notes'),
        },
      },
    });
    renderWithProviders(<MeetingNotesView />, { store });

    const iframe = screen.getByTitle('moderationbar-button-meeting-notes-tooltip');

    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', 'https://example.com/notes');
  });

  it('renders nothing when meetingNotesUrl is null', () => {
    const { store } = configureStore();
    const { container } = renderWithProviders(<MeetingNotesView />, { store });

    expect(container).toBeEmptyDOMElement();
  });
});
