// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ListItemText, Menu as MuiMenu, MenuItem as MuiMenuItem, styled } from '@mui/material';
import { truncate } from 'lodash';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppDispatch } from '../../../hooks';
import { chatConversationStateSet } from '../../../store/slices/uiSlice';
import { ChatScope, Participant, ParticipantId } from '../../../types';

interface INewMessagePopoverProps<T> {
  open: boolean;
  setAnchorEl: Dispatch<SetStateAction<T | undefined>>;
  anchorEl: (T & Element) | undefined;
  participants: Participant[];
}

const Menu = styled(MuiMenu)(({ theme }) => ({
  '& .MuiList-root': {
    maxHeight: '16rem',
    padding: theme.spacing(2),
  },
}));

const MenuItem = styled(MuiMenuItem)(({ theme }) => ({
  justifyContent: 'space-between',

  "&[aria-disabled='true']": {
    paddingLeft: 0,
    paddingRight: 0,
    opacity: 1,
  },

  '&.Mui-focusVisible': {
    backgroundColor: theme.palette.secondary.light,
  },
}));

function NewMessagePopover<T>({ setAnchorEl, anchorEl, open, participants }: INewMessagePopoverProps<T>) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const handleClose = () => {
    setAnchorEl(undefined);
  };

  const handleChatSelected = (target: ParticipantId) => {
    dispatch(
      chatConversationStateSet({
        scope: ChatScope.Private,
        target,
      })
    );
    setAnchorEl(undefined);
  };

  const renderParticipantItems = () =>
    participants.length > 0
      ? [
          <MenuItem disabled={true} key="chat-private-scope">
            <ListItemText>{t('chat-private-scope')}</ListItemText>
          </MenuItem>,
          participants.map((participant) => (
            <MenuItem key={participant.id} onClick={() => handleChatSelected(participant.id)}>
              <ListItemText translate="no">{truncate(participant.displayName, { length: 40 })}</ListItemText>
            </MenuItem>
          )),
        ]
      : null;

  return (
    <Menu
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      keepMounted
    >
      {renderParticipantItems()}
    </Menu>
  );
}

export default NewMessagePopover;
