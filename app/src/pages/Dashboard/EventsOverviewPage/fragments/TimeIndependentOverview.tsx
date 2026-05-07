// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { MeetingsProp } from '../types';
import EventsOverview from './EventsOverview';

interface TimeIndependentOverviewProps {
  groups: Array<MeetingsProp>;
  isFetching: boolean;
  isLoading: boolean;
  onNextPage: (after: string) => void;
  onPreviousPage: () => void;
  currentCursorIndex: number;
}

export function TimeIndependentOverview({
  groups,
  isFetching,
  isLoading,
  onNextPage,
  onPreviousPage,
  currentCursorIndex,
}: TimeIndependentOverviewProps) {
  const after = groups[0]?.after;
  const showPagination = currentCursorIndex >= 0 || after !== undefined;

  return (
    <>
      <EventsOverview entries={groups} isFetching={isFetching} isLoading={isLoading} />
      {showPagination && (
        <Pagination
          after={after}
          onNextPage={onNextPage}
          onPreviousPage={onPreviousPage}
          currentCursorIndex={currentCursorIndex}
        />
      )}
    </>
  );
}

interface PaginationProps {
  after?: string;
  onNextPage: (after: string) => void;
  onPreviousPage: () => void;
  currentCursorIndex: number;
}

function Pagination({ after, onNextPage, onPreviousPage, currentCursorIndex }: PaginationProps) {
  const { t } = useTranslation();

  const handleNextPage = () => {
    if (after) {
      onNextPage(after);
    }
  };

  const handlePreviousPage = () => {
    onPreviousPage();
  };

  return (
    <Box gap={1} display="flex" justifyContent="flex-end" mt={2}>
      <Button disabled={currentCursorIndex === -1} onClick={handlePreviousPage}>
        {t('global-previous')}
      </Button>
      <Button disabled={!after} onClick={handleNextPage}>
        {t('global-next')}
      </Button>
    </Box>
  );
}

export default TimeIndependentOverview;
