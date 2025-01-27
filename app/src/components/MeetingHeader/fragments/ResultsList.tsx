// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { MenuList as MuiMenuList, Typography, ListSubheader as MuiListSubheader, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from '../../../hooks';
import { selectAllVotes } from '../../../store/slices/legalVoteSlice';
import { selectAllPolls } from '../../../store/slices/pollSlice';
import ResultsItem from './ResultsItem';

const MenuList = styled(MuiMenuList)(({ theme }) => ({
  maxWidth: theme.typography.pxToRem(420),
}));

const ListSubheader = styled(MuiListSubheader)(({ theme }) => ({
  background: 'transparent',
  '& .MuiTypography-root': {
    color: theme.palette.primary.contrastText,
  },
}));

const ResultsList = () => {
  const { t } = useTranslation();
  const votes = useAppSelector(selectAllVotes);
  const polls = useAppSelector(selectAllPolls);

  return (
    <MenuList
      autoFocusItem
      subheader={
        <ListSubheader>
          <Typography variant="h2" align="center">
            {t('votes-poll-overview-title')}
          </Typography>
        </ListSubheader>
      }
    >
      {votes.map((vote) => (
        <ResultsItem key={vote.id} item={vote} />
      ))}
      {polls.map((poll) => (
        <ResultsItem key={poll.id} item={poll} />
      ))}
    </MenuList>
  );
};

export default ResultsList;
