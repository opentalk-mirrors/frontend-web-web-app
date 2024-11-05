// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  Box,
  List as MuiList,
  ListItem,
  ListItemButton as MuiListItemButton,
  ListItemText,
  styled,
  Typography,
  Stack,
} from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import NoPollsIcon from '../../../assets/images/no-poll-illustration.svg?react';
import { AccordionItem } from '../../../commonComponents';
import { useAppSelector } from '../../../hooks';
import { selectAllPolls, selectAllSavedPolls } from '../../../store/slices/pollSlice';
import PollOverviewPanel from './PollOverviewPanel';

interface IPollOverview {
  onClickItem: (formId: number | undefined) => void;
}

const List = styled(MuiList)({
  width: '100%',
  overflow: 'auto',
});

const EmptyPollContainer = styled(Stack)({
  justifyContent: 'center',
  alignItems: 'center',
  flex: 1,
});

const ListItemButton = styled(MuiListItemButton)(({ theme }) => ({
  borderRadius: '0.5rem',
  backgroundColor: theme.palette.secondary.light,
  color: theme.palette.secondary.contrastText,
  '&:hover': {
    backgroundColor: theme.palette.secondary.main,
  },
  '&:not(:last-child) ': {
    marginBottom: theme.spacing(1),
  },
}));

const PollOverview = ({ onClickItem }: IPollOverview) => {
  const { t } = useTranslation();
  const [accordionState, setAccordionState] = useState({
    savedPolls: true,
    createdPolls: true,
  });
  const polls = useAppSelector(selectAllPolls);
  const savedPolls = useAppSelector(selectAllSavedPolls);

  if (polls.length === 0 && savedPolls.length === 0) {
    return (
      <EmptyPollContainer>
        <Box marginBottom={2}>
          <NoPollsIcon />
        </Box>
        <Typography align="center" variant="body2">
          {t('no-polls-in-conference')}
        </Typography>
      </EmptyPollContainer>
    );
  }

  const renderSavedPolls = () => (
    <AccordionItem
      onChange={() =>
        setAccordionState((prevState) => ({
          ...prevState,
          savedPolls: !prevState.savedPolls,
        }))
      }
      option={t('poll-overview-saved-legal-votes')}
      expanded={accordionState.savedPolls}
      summaryText={t('poll-overview-saved-legal-votes')}
    >
      <List>
        {savedPolls.map((savedPoll, index: number) => (
          <ListItemButton key={index} onClick={() => onClickItem(savedPoll.id)}>
            <ListItemText primary={savedPoll.topic} />
          </ListItemButton>
        ))}
      </List>
    </AccordionItem>
  );

  const renderPolls = () => (
    <AccordionItem
      onChange={() =>
        setAccordionState((prevState) => ({
          ...prevState,
          createdPolls: !prevState.createdPolls,
        }))
      }
      option={t('poll-overview-created-legal-votes')}
      expanded={accordionState.createdPolls}
      summaryText={t('poll-overview-created-legal-votes')}
    >
      <List>
        {polls.map((poll, index) => (
          <ListItem key={index}>
            <PollOverviewPanel poll={poll} />
          </ListItem>
        ))}
      </List>
    </AccordionItem>
  );

  return (
    <Box display="flex" flexDirection="column" flex={1} marginBottom={1} overflow="hidden">
      <Box height="100%" overflow="auto">
        {savedPolls.length > 0 && renderSavedPolls()}
        {polls.length > 0 && renderPolls()}
      </Box>
    </Box>
  );
};

export default PollOverview;
