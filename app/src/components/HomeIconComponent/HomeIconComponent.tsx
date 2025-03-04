// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Badge, styled } from '@mui/material';

import { HomeIcon } from '../../assets/icons';
import { ModerationTabKey } from '../../config/constants';
import { useAppSelector } from '../../hooks';
import { selectUnreadGlobalMessageCount, selectUnreadPersonalMessageCount } from '../../store/slices/chatSlice';
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
  const unreadGlobalMessageCount = useAppSelector(selectUnreadGlobalMessageCount);
  const unreadPersonalMessageCount = useAppSelector(selectUnreadPersonalMessageCount);
  const showUnreadBadge =
    activeTab !== ModerationTabKey.Home && unreadGlobalMessageCount + unreadPersonalMessageCount > 0;

  return (
    <>
      <HomeIcon />
      {showUnreadBadge && <ChatBadge variant="dot" />}
    </>
  );
};

export default HomeIconComponent;
