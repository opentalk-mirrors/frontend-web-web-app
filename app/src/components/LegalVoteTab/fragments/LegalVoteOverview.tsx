// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  Typography,
  Box,
  List as MuiList,
  ListItem,
  ListItemText,
  styled,
  ListItemButton as MuiListItemButton,
  Stack,
} from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { NoVotesIcon } from '../../../assets/icons';
import { AccordionItem } from '../../../commonComponents';
import { selectAllSavedLegalVotes, selectAllVotes } from '../../../store/slices/legalVoteSlice';
import LegalVoteOverviewPanel from './LegalVoteOverviewPanel';

interface ILegalVoteOverviewProps {
  onClickItem: (formId: number | undefined) => void;
}

const List = styled(MuiList)({
  width: '100%',
});

const ListItemButton = styled(MuiListItemButton)(({ theme }) => ({
  borderRadius: theme.borderRadius.medium,
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.secondary.lighter,
  },
  '&:not(:last-child) ': {
    marginBottom: theme.spacing(1),
  },
}));

const StyledNoVotesIcon = styled(NoVotesIcon)({
  width: '7.5rem',
  height: '7.5rem',
});

const LegalVoteOverview = ({ onClickItem }: ILegalVoteOverviewProps) => {
  const { t } = useTranslation();
  const [accordionState, setAccordionState] = useState({
    savedVotes: true,
    createdVotes: true,
  });
  const votes = useSelector(selectAllVotes);
  const savedLegalVotes = useSelector(selectAllSavedLegalVotes);

  if (votes.length === 0 && savedLegalVotes.length === 0) {
    return (
      <Stack
        spacing={2}
        sx={{
          flex: 1,
          overflow: 'auto',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Box>
          <StyledNoVotesIcon />
        </Box>
        <Typography align="center" variant="body2">
          {t('no-votes-in-conference')}
        </Typography>
      </Stack>
    );
  }

  const renderSavedLegalVotes = () => (
    <AccordionItem
      onChange={() =>
        setAccordionState((prevState) => ({
          ...prevState,
          savedVotes: !prevState.savedVotes,
        }))
      }
      option={t('legal-vote-overview-saved-legal-votes')}
      expanded={accordionState.savedVotes}
      summaryText={t('legal-vote-overview-saved-legal-votes')}
      headingComponent="h4"
    >
      <List>
        {savedLegalVotes.map((savedLegalVote, index: number) => (
          <ListItemButton key={index} onClick={() => onClickItem(savedLegalVote.id)}>
            <ListItemText primary={savedLegalVote.name} secondary={savedLegalVote.topic} />
          </ListItemButton>
        ))}
      </List>
    </AccordionItem>
  );

  const renderLegalVotes = () => (
    <AccordionItem
      onChange={() =>
        setAccordionState((prevState) => ({
          ...prevState,
          createdVotes: !prevState.createdVotes,
        }))
      }
      option={t('legal-vote-overview-created-legal-votes')}
      expanded={accordionState.createdVotes}
      summaryText={t('legal-vote-overview-created-legal-votes')}
      headingComponent="h4"
    >
      <List>
        {votes.map((vote, index) => (
          <ListItem key={index} disableGutters>
            <LegalVoteOverviewPanel vote={vote} />
          </ListItem>
        ))}
      </List>
    </AccordionItem>
  );

  return (
    <Stack
      sx={{
        flex: 1,
        overflow: 'auto',
      }}
    >
      {savedLegalVotes.length > 0 && renderSavedLegalVotes()}
      {votes.length > 0 && renderLegalVotes()}
    </Stack>
  );
};

export default LegalVoteOverview;
