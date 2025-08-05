// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Button, List as MuiList, Stack, Typography, styled } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { BackIcon, NewMessageIcon, NoMessagesIcon } from '../../assets/icons';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { selectAllPersonalChats } from '../../store/selectors';
import { selectAllOnlineParticipants } from '../../store/slices/participantsSlice';
import { chatConversationStateSet, selectChatConversationState } from '../../store/slices/uiSlice';
import { ChatScope, TargetId } from '../../types';
import Chat from '../Chat';
import ChatOverviewItem from './fragments/ChatOverviewItem';
import NewMessagePopover from './fragments/NewMessagePopover';

const StyledNoMessagesIcon = styled(NoMessagesIcon)({
  '&.MuiSvgIcon-root': {
    width: '5em',
    height: '5em',
  },
});

const List = styled(MuiList)({
  flex: 1,
  overflow: 'auto',
});

const Container = styled(Stack)(({ theme }) => ({
  flex: 1,
  width: '100%',
  paddingTop: theme.typography.pxToRem(4),
}));

/**
 * Added margin to avoid outline being cut off
 */
const AdjustedButton = styled(Button)(({ theme }) => ({
  //Overrides some MuiStack-root>:not(style):not(style) class that applies margin 0
  '&&.MuiButton-root': {
    marginLeft: theme.typography.pxToRem(4),
  },
}));

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
        {chats.map((chat) => (
          <ChatOverviewItem key={chat.id} onClick={() => setSelectedChat(chat.scope, chat.id)} chat={chat} />
        ))}
      </List>
    ) : (
      <Stack
        spacing={2}
        sx={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <StyledNoMessagesIcon type="decorative" />
        <Typography align="center" variant="body2">
          {t('empty-messages')}
        </Typography>
      </Stack>
    );

  if (chatConversationState.scope !== undefined && chatConversationState.targetId !== undefined) {
    return (
      <Container alignItems="flex-start" spacing={1}>
        <AdjustedButton
          size="small"
          startIcon={<BackIcon />}
          variant="text"
          color="secondary"
          onClick={resetSelectedChat}
        >
          {t('button-back-messages')}
        </AdjustedButton>
        <Chat
          scope={chatConversationState.scope}
          target={chatConversationState.targetId}
          // We want to focus chat input for the private and group messages
          // which are the ones containing `targetId`.
          autoFocusMessageInput={Boolean(chatConversationState.targetId)}
        />
      </Container>
    );
  }

  const open = Boolean(anchorEl);

  return (
    <Container spacing={1} overflow="hidden">
      <Box>
        <AdjustedButton
          size="small"
          disabled={participants.length === 0}
          onClick={newMessageClickHandler}
          variant="text"
          focusRipple={true}
          startIcon={<NewMessageIcon />}
        >
          {t('button-new-message')}
        </AdjustedButton>
      </Box>
      <NewMessagePopover open={open} setAnchorEl={setAnchorEl} anchorEl={anchorEl} />
      {renderChats()}
    </Container>
  );
};

export default ChatOverview;
