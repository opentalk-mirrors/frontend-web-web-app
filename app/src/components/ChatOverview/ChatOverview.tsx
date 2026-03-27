// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Button, List as MuiList, Stack, Typography, styled } from '@mui/material';
import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { BackIcon, NewMessageIcon, NoMessagesIcon } from '../../assets/icons';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { selectOtherOnlineParticipants, selectAllPersonalChats } from '../../store/selectors';
import { PrivateChatProps } from '../../store/slices/chatSlice';
import { chatConversationStateSet, selectChatConversationState } from '../../store/slices/uiSlice';
import { ChatScope, ParticipantId } from '../../types';
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
  '&.Mui-disabled': {
    color: theme.palette.text.disabled,
  },
}));

const ChatOverview = () => {
  const chatConversationState = useAppSelector(selectChatConversationState);
  const { t } = useTranslation();
  const chats = useAppSelector(selectAllPersonalChats);
  const dispatch = useAppDispatch();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement>();
  const participants = useAppSelector(selectOtherOnlineParticipants);

  const setSelectedChat = (target: ParticipantId) => {
    dispatch(chatConversationStateSet({ scope: ChatScope.Private, target }));
  };

  const newMessageClickHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const resetSelectedChat = useCallback(() => {
    dispatch(
      chatConversationStateSet({
        scope: ChatScope.Global,
      })
    );
  }, [dispatch]);

  useEffect(() => {
    return () => {
      resetSelectedChat();
    };
  }, [resetSelectedChat]);

  const renderChats = () =>
    chats.length > 0 ? (
      <List>
        {chats.map(
          (chat) =>
            chat.chatIdentifier.scope === ChatScope.Private && (
              <ChatOverviewItem
                key={chat.chatIdentifier.target}
                onClick={() => setSelectedChat(chat.chatIdentifier.target as ParticipantId)}
                chat={chat as PrivateChatProps}
              />
            )
        )}
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

  if (chatConversationState.scope === ChatScope.Private && chatConversationState.target !== '') {
    return (
      <Container alignItems="flex-start" spacing={1}>
        <AdjustedButton
          size="small"
          startIcon={<BackIcon />}
          variant="text"
          color="primary"
          onClick={resetSelectedChat}
        >
          {t('button-back-messages')}
        </AdjustedButton>
        <Chat />
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
          color="secondary"
        >
          {t('button-new-message')}
        </AdjustedButton>
      </Box>
      <NewMessagePopover open={open} setAnchorEl={setAnchorEl} anchorEl={anchorEl} participants={participants} />
      {renderChats()}
    </Container>
  );
};

export default ChatOverview;
