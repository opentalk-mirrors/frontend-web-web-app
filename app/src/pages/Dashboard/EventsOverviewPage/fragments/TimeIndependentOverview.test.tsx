// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen } from '@testing-library/react';

import TimeIndependentOverview from './TimeIndependentOverview';

vi.mock('./EventsOverview', () => ({
  __esModule: true,
  default: () => <div>Mocked EventsOverview</div>,
}));

const DEFAULT_PROPS = {
  groups: [],
  isFetching: false,
  isLoading: false,
  onNextPage: () => {},
  onPreviousPage: () => {},
  currentCursorIndex: -1,
  cursors: [],
};

describe('TimeIndependentOverview', () => {
  it('renders without groups', () => {
    render(<TimeIndependentOverview {...DEFAULT_PROPS} />);
    expect(screen.getByText('Mocked EventsOverview')).toBeInTheDocument();
  });

  it('do not render pagination buttons when there is no next page', () => {
    const groups = [{ title: 'Time independent group', events: [] }];
    render(<TimeIndependentOverview {...DEFAULT_PROPS} groups={groups} />);
    const previousButton = screen.queryByText('global-previous');
    const nextButton = screen.queryByText('global-next');
    expect(previousButton).toBeNull();
    expect(nextButton).toBeNull();
  });

  it("renders pagination buttons when 'after' cursor is present", () => {
    const groups = [{ title: 'Time independent group', events: [], after: 'cursor1' }];
    render(<TimeIndependentOverview {...DEFAULT_PROPS} groups={groups} />);
    const previousButton = screen.getByText('global-previous');
    const nextButton = screen.getByText('global-next');
    expect(previousButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
  });

  it("enables next button when 'after' cursor is present", () => {
    const groups = [{ title: 'Time independent group', events: [], after: 'cursor1' }];
    render(<TimeIndependentOverview {...DEFAULT_PROPS} groups={groups} />);
    const nextButton = screen.getByText('global-next');
    expect(nextButton).toBeEnabled();
  });

  it('enables previous button when currentCursorIndex is greater than -1', () => {
    render(<TimeIndependentOverview {...DEFAULT_PROPS} currentCursorIndex={0} />);
    const previousButton = screen.getByText('global-previous');
    expect(previousButton).toBeEnabled();
  });

  it('calls onNextPage with the correct cursor when next button is clicked', () => {
    const onNextPageMock = vi.fn();
    const groups = [{ title: 'Time independent group', events: [], after: 'cursor1' }];
    render(<TimeIndependentOverview {...DEFAULT_PROPS} groups={groups} onNextPage={onNextPageMock} />);
    const nextButton = screen.getByText('global-next');
    nextButton.click();
    expect(onNextPageMock).toHaveBeenCalledWith('cursor1');
  });

  it('calls onPreviousPage when previous button is clicked', () => {
    const onPreviousPageMock = vi.fn();
    render(<TimeIndependentOverview {...DEFAULT_PROPS} currentCursorIndex={0} onPreviousPage={onPreviousPageMock} />);
    const previousButton = screen.getByText('global-previous');
    previousButton.click();
    expect(onPreviousPageMock).toHaveBeenCalled();
  });
});
