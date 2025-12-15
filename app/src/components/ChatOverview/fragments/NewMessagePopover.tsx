// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ListItemText, Menu as MuiMenu, MenuItem as MuiMenuItem, styled } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '../../../hooks';
import { selectAllOnlineParticipants } from '../../../store/slices/participantsSlice';
import { chatConversationStateSet } from '../../../store/slices/uiSlice';
import { selectGroups } from '../../../store/slices/userSlice';
import { ChatScope, TargetId } from '../../../types';

interface INewMessagePopoverProps<T> {
  open: boolean;
  setAnchorEl: Dispatch<SetStateAction<T | undefined>>;
  anchorEl: (T & Element) | undefined;
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

function NewMessagePopover<T>({ setAnchorEl, anchorEl, open }: INewMessagePopoverProps<T>) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const groups = useAppSelector(selectGroups);
  const participants = useAppSelector(selectAllOnlineParticipants);

  const handleClose = () => {
    setAnchorEl(undefined);
  };

  const handleChatSelected = (targetId: TargetId, scope: ChatScope) => {
    dispatch(
      chatConversationStateSet({
        scope,
        targetId,
      })
    );
    setAnchorEl(undefined);
  };

  const renderGroupItems = () =>
    groups.length > 0
      ? [
          <MenuItem disabled={true} key="chat-group-scope">
            <ListItemText>{t('chat-group-scope')}</ListItemText>
          </MenuItem>,
          groups.map((group) => (
            <MenuItem key={group} onClick={() => handleChatSelected(group, ChatScope.Group)}>
              <ListItemText>{group}</ListItemText>
            </MenuItem>
          )),
        ]
      : null;

  const renderParticipantItems = () =>
    participants.length > 0
      ? [
          <MenuItem disabled={true} key="chat-private-scope">
            <ListItemText>{t('chat-private-scope')}</ListItemText>
          </MenuItem>,
          participants.map((participant) => (
            <MenuItem key={participant.id} onClick={() => handleChatSelected(participant.id, ChatScope.Private)}>
              <ListItemText translate="no">{participant.displayName}</ListItemText>
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
      {renderGroupItems()}
      {renderParticipantItems()}
    </Menu>
  );
}

export default NewMessagePopover;
