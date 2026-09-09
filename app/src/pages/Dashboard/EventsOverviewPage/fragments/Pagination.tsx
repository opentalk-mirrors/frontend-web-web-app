// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface PaginationProps {
  after?: string;
  isFetching: boolean;
  onNextPage: (after: string) => void;
  onPreviousPage: () => void;
  currentCursorIndex: number;
}

export function Pagination({ after, isFetching, onNextPage, onPreviousPage, currentCursorIndex }: PaginationProps) {
  const { t } = useTranslation();

  const handleNextPage = () => {
    if (after) {
      onNextPage(after);
    }
  };

  return (
    <Box
      sx={{
        gap: 1,
        display: 'flex',
        justifyContent: 'flex-end',
        mt: 2,
      }}
    >
      <Button disabled={currentCursorIndex === -1 || isFetching} onClick={onPreviousPage}>
        {t('global-previous')}
      </Button>
      <Button disabled={!after || isFetching} onClick={handleNextPage}>
        {t('global-next')}
      </Button>
    </Box>
  );
}

export default Pagination;
