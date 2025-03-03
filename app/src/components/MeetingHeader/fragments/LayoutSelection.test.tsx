import { useMediaQuery } from '@mui/material';
import { act, screen } from '@testing-library/react';

import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import LayoutSelection from './LayoutSelection';

const mockFullscreenContext = {
  active: true,
  node: null,
  exit: jest.fn(),
  enter: jest.fn(),
  fullscreenParticipantID: '',
  setRootElement: jest.fn(),
  rootElement: null,
  setHasActiveOverlay: jest.fn(),
  isFullScreenAvailable: jest.fn(),
};

jest.mock('../../../hooks/useFullscreenContext.ts', () => ({
  useFullscreenContext: () => mockFullscreenContext,
}));

jest.mock('@mui/material', () => {
  const mui = jest.requireActual('@mui/material');
  return {
    ...mui,
    useMediaQuery: jest.fn().mockReturnValue(false),
  };
});

const mockUseMediaQuery = useMediaQuery as jest.Mock;
const openMenu = async () => {
  const openButton = screen.getByRole('button', { name: 'conference-view-trigger-button' });
  await openButton.click();
};

describe('Layout selection menu', () => {
  afterEach(() => {
    mockUseMediaQuery.mockClear();
  });

  it('renders fullscreen button if overlay is active', async () => {
    const { store } = configureStore();
    mockFullscreenContext.isFullScreenAvailable = jest.fn(() => true);
    renderWithProviders(<LayoutSelection />, {
      store,
    });
    await act(openMenu);
    expect(mockFullscreenContext.isFullScreenAvailable).toHaveBeenCalled();

    const fullscreenMenuItem = screen.getByRole('menuitemradio', { name: 'conference-view-fullscreen', hidden: true });
    expect(fullscreenMenuItem).toBeInTheDocument();
  });
  it('does not render fullscreen button if fullscreen feature is unavailable', async () => {
    const { store } = configureStore();
    mockFullscreenContext.isFullScreenAvailable = jest.fn(() => false);

    renderWithProviders(<LayoutSelection />, {
      store,
    });

    await act(openMenu);

    expect(mockFullscreenContext.isFullScreenAvailable).toHaveBeenCalled();

    expect(
      screen.queryByRole('menuitemradio', { name: 'conference-view-fullscreen', hidden: true })
    ).not.toBeInTheDocument();
  });

  it('renders meeting notes option on mobile when meeting notes are available', async () => {
    mockUseMediaQuery.mockReturnValue(true);
    const { store } = configureStore({
      initialState: {
        meetingNotes: {
          meetingNotesUrl: 'meeting.notes',
        },
      },
    });

    renderWithProviders(<LayoutSelection />, {
      store,
      provider: {
        snackbar: true,
      },
    });
    await act(openMenu);

    expect(mockUseMediaQuery).toHaveBeenCalled();

    const meetingNotesButton = screen.getByRole('menuitemradio', {
      name: 'moderationbar-button-meeting-notes-tooltip',
      hidden: true,
    });
    expect(meetingNotesButton).toBeInTheDocument();
  });
});
