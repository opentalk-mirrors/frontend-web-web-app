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

import { NoPollsIcon } from '../../../assets/icons';
import { AccordionItem } from '../../../commonComponents';
import { useAppSelector } from '../../../hooks';
import { selectAllPolls, selectAllSavedPolls } from '../../../store/slices/pollSlice';
import PollOverviewPanel from './PollOverviewPanel';

const StyledNoPollsIcon = styled(NoPollsIcon)({
  '&.MuiSvgIcon-root': {
    width: '5em',
    height: '5em',
  },
});

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
  borderRadius: theme.borderRadius.medium,
  backgroundColor: theme.palette.background.customPaper.primary,
  color: theme.palette.primary.contrastText,
  '&:hover': {
    backgroundColor: theme.palette.background.highlight.primary,
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
        <Box
          sx={{
            marginBottom: 2,
          }}
        >
          <StyledNoPollsIcon type="decorative" />
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
      expanded={accordionState.savedPolls}
      summaryText={t('poll-overview-saved-polls')}
      headingComponent="h4"
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
      expanded={accordionState.createdPolls}
      summaryText={t('poll-overview-created-polls')}
      headingComponent="h4"
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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        marginBottom: 1,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          height: '100%',
          overflow: 'auto',
        }}
      >
        {savedPolls.length > 0 && renderSavedPolls()}
        {polls.length > 0 && renderPolls()}
      </Box>
    </Box>
  );
};

export default PollOverview;
