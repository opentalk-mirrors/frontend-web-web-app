// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Button, List as MuiList, styled, Typography, Stack } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { BackIcon, NewMessageIcon } from '../../assets/icons';
import NoNewMessageImage from '../../assets/images/no-messages-illustration.svg?react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { selectAllPersonalChats } from '../../store/selectors';
import { selectAllOnlineParticipants } from '../../store/slices/participantsSlice';
import { chatConversationStateSet, selectChatConversationState } from '../../store/slices/uiSlice';
import { ChatScope, TargetId } from '../../types';
import Chat from '../Chat';
import ChatOverviewItem from './fragments/ChatOverviewItem';
import NewMessagePopover from './fragments/NewMessagePopover';

const List = styled(MuiList)({
  flex: 1,
  overflow: 'auto',
});

const ChatOverview = () => {
  const chatConversationState = useAppSelector(selectChatConversationState);
  const { t } = useTranslation();
  const chats = useAppSelector(selectAllPersonalChats);
  const dispatch = useAppDispatch();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement>();
  const participants = useAppSelector(selectAllOnlineParticipants);

  const setSelectedChat = (scope: ChatScope, targetId: TargetId) => {
    dispatch(
      chatConversationStateSet({
        scope: scope,
        targetId: targetId,
      })
    );
  };

  const newMessageClickHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const resetSelectedChat = () => {
    dispatch(
      chatConversationStateSet({
        scope: undefined,
        targetId: undefined,
      })
    );
  };

  const renderChats = () =>
    chats.length > 0 ? (
      <List>
        {chats.map((chat) =>
          chat.scope !== ChatScope.Global ? (
            <ChatOverviewItem key={chat.id} onClick={() => setSelectedChat(chat.scope, chat.id)} chat={chat} />
          ) : null
        )}
      </List>
    ) : (
      <Stack flex={1} justifyContent="center" alignItems="center" spacing={2}>
        <NoNewMessageImage width="7em" height="7em" />
        <Typography align="center" variant="body2">
          {t('empty-messages')}
        </Typography>
      </Stack>
    );

  if (chatConversationState.scope !== undefined && chatConversationState.targetId !== undefined)
    return (
      <Stack flex={1} width="100%" alignItems="flex-start" spacing={1}>
        <Button size="small" startIcon={<BackIcon />} variant="text" color="secondary" onClick={resetSelectedChat}>
          {t('button-back-messages')}
        </Button>
        <Chat
          scope={chatConversationState.scope}
          target={chatConversationState.targetId}
          // We want to focus chat input for the private and group messages
          // which are the ones containing `targetId`.
          autoFocusMessageInput={Boolean(chatConversationState.targetId)}
        />
      </Stack>
    );

  const open = Boolean(anchorEl);

  return (
    <Stack flex={1} width="100%" spacing={1} overflow="hidden">
      <Box>
        <Button
          size="small"
          disabled={participants.length === 0}
          onClick={newMessageClickHandler}
          variant="text"
          focusRipple={true}
          startIcon={<NewMessageIcon />}
        >
          {t('button-new-message')}
        </Button>
      </Box>
      <NewMessagePopover open={open} setAnchorEl={setAnchorEl} anchorEl={anchorEl} />
      {renderChats()}
    </Stack>
  );
};

export default ChatOverview;
