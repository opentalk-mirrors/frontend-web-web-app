// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled, Chip as MuiChip, MenuItem, ListItemIcon, ListItemText, MenuItemProps } from '@mui/material';
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
  //Chip is only visual, we want to keep the color
  '&.Mui-disabled': {
    opacity: 1,
  },
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

interface ResultsItemProps extends MenuItemProps {
  item: Pick<LegalVote, 'name' | 'id' | 'state'> | Pick<Poll, 'topic' | 'id' | 'state' | 'choices'>;
}

//Props are passed for accessibility reasons, autofocus doesn't get recognized otherwise and we cannot navigate into the list.
//I assume this is because it is an outside component and it is only inferred if declared inline.
const ResultsItem = ({ item, ...props }: ResultsItemProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const openItem = (item: Pick<LegalVote, 'id'> | Pick<Poll, 'id'>) => {
    dispatch(setVoteOrPollIdToShow(item.id));
  };

  const label = Object.hasOwn(item, 'name') ? (item as LegalVote).name : (item as Poll).topic;

  return (
    <CustomMenuItem {...props} onClick={() => openItem(item)} role="menuitem">
      <ListItemIcon>{Object.hasOwn(item, 'choices') ? <PollIcon /> : <LegalBallotIcon />}</ListItemIcon>
      <ListItemText slotProps={{ primary: { noWrap: true } }} primary={label} />
      <Chip
        size="medium"
        label={t(`global-state-${item.state}`)}
        color={item.state === 'active' || item.state === LegalVoteState.Started ? 'success' : 'error'}
        variant="filled"
        disabled
      />
    </CustomMenuItem>
  );
};

export default ResultsItem;
