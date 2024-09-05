// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled, Chip as MuiChip, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { LegalBallotIcon, PollIcon } from '../../../assets/icons';
import { useAppDispatch } from '../../../hooks';
import { Poll } from '../../../store/slices/pollSlice';
import { setVoteOrPollIdToShow } from '../../../store/slices/uiSlice';
import { LegalVote, LegalVoteState } from '../../../types';

const Chip = styled(MuiChip)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  marginRight: 0,
  borderRadius: 0,
  borderColor: 'transparent',
  '& .MuiChip-label': {
    paddingRight: 0,
    '&:first-letter': {
      textTransform: 'capitalize',
    },
  },
}));

const CustomMenuItem = styled(MenuItem)(() => ({
  display: 'flex',
  '&:hover': {
    cursor: 'pointer',
  },
}));

interface ResultsItemProps {
  item: LegalVote | Poll;
}

const ResultsItem = ({ item }: ResultsItemProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const openItem = (item: LegalVote | Poll) => {
    dispatch(setVoteOrPollIdToShow(item.id));
  };

  const label = Object.hasOwn(item, 'name') ? (item as LegalVote).name : (item as Poll).topic;

  return (
    <CustomMenuItem key={item.id} onClick={() => openItem(item)}>
      <ListItemIcon>{Object.hasOwn(item, 'choices') ? <PollIcon /> : <LegalBallotIcon />}</ListItemIcon>
      <ListItemText primaryTypographyProps={{ noWrap: true }} primary={label} />
      <Chip
        size="medium"
        label={t(`global-state-${item.state}`)}
        color={item.state === 'active' || item.state === LegalVoteState.Started ? 'success' : 'error'}
        variant="filled"
        clickable={false}
      />
    </CustomMenuItem>
  );
};

export default ResultsItem;
