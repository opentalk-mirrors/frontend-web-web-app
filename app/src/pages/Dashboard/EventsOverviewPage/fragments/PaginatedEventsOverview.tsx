// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { MeetingsProp } from '../types';
import EventsOverview from './EventsOverview';
import Pagination from './Pagination';

interface PaginatedEventsOverviewProps {
  groups: Array<MeetingsProp>;
  isFetching: boolean;
  isLoading: boolean;
  after?: string;
  onNextPage: (after: string) => void;
  onPreviousPage: () => void;
  currentCursorIndex: number;
}

function PaginatedEventsOverview({
  groups,
  isFetching,
  isLoading,
  after,
  onNextPage,
  onPreviousPage,
  currentCursorIndex,
}: PaginatedEventsOverviewProps) {
  const showPagination = currentCursorIndex >= 0 || after !== undefined;

  return (
    <>
      <EventsOverview key={groups[0]?.title ?? 'none'} entries={groups} isFetching={isFetching} isLoading={isLoading} />
      {showPagination && (
        <Pagination
          after={after}
          isFetching={isFetching}
          onNextPage={onNextPage}
          onPreviousPage={onPreviousPage}
          currentCursorIndex={currentCursorIndex}
        />
      )}
    </>
  );
}

export default PaginatedEventsOverview;
