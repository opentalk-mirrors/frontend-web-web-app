// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { MAX_GRID_TILES_DESKTOP } from '../../../constants';
import LayoutOptions from '../../../enums/LayoutOptions';
import { WaitingState } from '../../../types';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import DesktopMeetingHeader from './DesktopMeetingHeader';

vi.mock('./LayoutSelection', () => ({
  __esModule: true,
  default: () => <div>LayoutSelection</div>,
}));

vi.mock('./RoomTitle', () => ({
  __esModule: true,
  default: () => <div>RoomTitle</div>,
}));

vi.mock('./MeetingUtilsSection', () => ({
  __esModule: true,
  default: () => <div>MeetingUtilsSection</div>,
}));

vi.mock('./SharedFolderPopover', () => ({
  __esModule: true,
  SharedFolderPopover: () => <div>SharedFolderPopover</div>,
}));

vi.mock('./VotesAndPollsResultsPopover', () => ({
  __esModule: true,
  default: () => <div>VotesAndPollsResultsPopover</div>,
}));

const MOCK_PARTICIPANTS = {
  ids: Array.from({ length: 2 * MAX_GRID_TILES_DESKTOP }, (_, i) => String(i)),
  entities: Array.from({ length: 2 * MAX_GRID_TILES_DESKTOP }, (_, i) => ({
    id: String(i),
    waitingState: WaitingState.Joined,
    leftAt: null,
    breakoutRoomId: undefined,
  })),
};

const MOCK_UI = {
  cinemaLayout: LayoutOptions.Speaker,
};

const { store } = configureStore({
  initialState: {
    participants: MOCK_PARTICIPANTS,
    ui: MOCK_UI,
    breakout: {
      selectCurrentBreakoutRoomId: undefined,
    },
    sharedFolder: {
      sharedFolderData: {
        read: undefined,
      },
    },
  },
});

describe('DesktopMeetingHeader rendering logic', () => {
  it('should render without crashing', () => {
    expect(() => renderWithProviders(<DesktopMeetingHeader />, { store, provider: { mui: true } })).not.toThrow();
  });

  it('renders header pagination when layout is grid.', () => {
    const { unmount } = renderWithProviders(<DesktopMeetingHeader />, { store, provider: { mui: true } });
    expect(screen.queryByText('1')).not.toBeInTheDocument();
    expect(screen.queryByText('2')).not.toBeInTheDocument();
    const { store: nextStore } = configureStore({
      initialState: {
        participants: MOCK_PARTICIPANTS,
        ui: { cinemaLayout: LayoutOptions.Grid, lastCinemaLayout: LayoutOptions.Grid },
      },
    });
    unmount();
    renderWithProviders(<DesktopMeetingHeader />, { store: nextStore, provider: { mui: true } });
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should render whiteboard button when whiteboard is available and layout is not whiteboard.', () => {
    const label = 'whiteboard-start-whiteboard-button';
    const { store } = configureStore({
      initialState: {
        participants: MOCK_PARTICIPANTS,
        ui: { cinemaLayout: LayoutOptions.Whiteboard },
        whiteboard: { isWhiteboardAvailable: false },
      },
    });
    const { unmount } = renderWithProviders(<DesktopMeetingHeader />, { store, provider: { mui: true } });
    expect(screen.queryByLabelText(label)).not.toBeInTheDocument();
    unmount();
    const { store: nextStore } = configureStore({
      initialState: {
        participants: MOCK_PARTICIPANTS,
        ui: { cinemaLayout: LayoutOptions.Grid },
        whiteboard: { isWhiteboardAvailable: true },
      },
    });
    renderWithProviders(<DesktopMeetingHeader />, { store: nextStore, provider: { mui: true } });
    expect(screen.getByLabelText(label)).toBeInTheDocument();
  });

  it('should render meeting notes button when meeting notes are available and layout is not meeting notes.', () => {
    const label = 'meeting-notes-button-show';
    const { store } = configureStore({
      initialState: {
        participants: MOCK_PARTICIPANTS,
        ui: { cinemaLayout: LayoutOptions.MeetingNotes },
        breakout: {
          selectCurrentBreakoutRoomId: undefined,
        },
        meetingNotes: { meetingNotesUrl: undefined },
      },
    });
    const { unmount } = renderWithProviders(<DesktopMeetingHeader />, { store, provider: { mui: true } });
    expect(screen.queryByLabelText(label)).not.toBeInTheDocument();
    const { store: secondStore } = configureStore({
      initialState: {
        participants: MOCK_PARTICIPANTS,
        ui: { cinemaLayout: LayoutOptions.MeetingNotes },
        breakout: {
          selectCurrentBreakoutRoomId: undefined,
        },
        meetingNotes: { meetingNotesUrl: 'https://example.com' },
      },
    });
    unmount();
    renderWithProviders(<DesktopMeetingHeader />, { store: secondStore, provider: { mui: true } });
    expect(screen.queryByLabelText(label)).not.toBeInTheDocument();
    const { store: thirdStore } = configureStore({
      initialState: {
        participants: MOCK_PARTICIPANTS,
        ui: { cinemaLayout: LayoutOptions.Grid },
        breakout: {
          selectCurrentBreakoutRoomId: undefined,
        },
        meetingNotes: { meetingNotesUrl: 'https://example.com' },
      },
    });
    unmount();
    renderWithProviders(<DesktopMeetingHeader />, { store: thirdStore, provider: { mui: true } });
    expect(screen.getByLabelText(label)).toBeInTheDocument();
  });

  it('should render shared folder button when shared folder is available.', () => {
    const { unmount } = renderWithProviders(<DesktopMeetingHeader />, { store, provider: { mui: true } });
    expect(screen.queryByText('SharedFolderPopover')).not.toBeInTheDocument();
    unmount();
    const { store: secondStore } = configureStore({
      initialState: {
        participants: MOCK_PARTICIPANTS,
        ui: { cinemaLayout: LayoutOptions.Grid },
        breakout: {
          selectCurrentBreakoutRoomId: undefined,
        },
        sharedFolder: {
          sharedFolderData: {
            read: {
              url: 'https://example.com',
              password: 'password',
            },
            readWrite: undefined,
          },
        },
      },
    });
    renderWithProviders(<DesktopMeetingHeader />, { store: secondStore, provider: { mui: true } });
    expect(screen.getByText('SharedFolderPopover')).toBeInTheDocument();
  });

  it('should render votes and polls button when votes and polls are available.', () => {
    const { store } = configureStore({
      initialState: {
        participants: MOCK_PARTICIPANTS,
        ui: { cinemaLayout: LayoutOptions.Grid },
        legalVote: {
          votes: {
            ids: [],
            entities: [],
          },
        },
      },
    });
    const { unmount } = renderWithProviders(<DesktopMeetingHeader />, { store, provider: { mui: true } });
    expect(screen.queryByText('VotesAndPollsResultsPopover')).not.toBeInTheDocument();
    unmount();
    const { store: secondStore } = configureStore({
      initialState: {
        participants: MOCK_PARTICIPANTS,
        ui: { cinemaLayout: LayoutOptions.Grid },
        legalVote: {
          votes: {
            ids: ['1'],
            entities: [
              {
                id: '1',
              },
            ],
          },
        },
        poll: {
          polls: {
            ids: [],
            entities: [],
          },
        },
      },
    });
    renderWithProviders(<DesktopMeetingHeader />, { store: secondStore, provider: { mui: true } });
    expect(screen.getByText('VotesAndPollsResultsPopover')).toBeInTheDocument();
  });
});
