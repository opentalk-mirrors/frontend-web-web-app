// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Badge, styled } from '@mui/material';

import { HomeIcon } from '../../assets/icons';
import { ModerationTabKey } from '../../config/constants';
import { useAppSelector } from '../../hooks';
import { selectHasAnyUnreadPrivateChatMessage, selectHasUnreadGlobalChatMessages } from '../../store/slices/chatSlice';
import { selectActiveTab } from '../../store/slices/uiSlice';

const ChatBadge = styled(Badge)(({ theme }) => ({
  right: -4,
  top: -3,
  '& .MuiBadge-badge': {
    background: theme.palette.primary.main,
  },
}));

const HomeIconComponent = () => {
  const activeTab = useAppSelector(selectActiveTab);
  const hasUnreadGlobalMessages = useAppSelector(selectHasUnreadGlobalChatMessages);
  const hasUnreadPrivateMessages = useAppSelector(selectHasAnyUnreadPrivateChatMessage);
  const showUnreadBadge = activeTab !== ModerationTabKey.Home && (hasUnreadGlobalMessages || hasUnreadPrivateMessages);

  return (
    <>
      <HomeIcon />
      {showUnreadBadge && <ChatBadge variant="dot" role="presentation" />}
    </>
  );
};

export default HomeIconComponent;
