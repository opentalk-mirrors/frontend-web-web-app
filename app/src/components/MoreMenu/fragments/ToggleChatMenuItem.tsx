// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ChatIcon } from '@livekit/components-react';
import { ListItemIcon, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { disableChat, enableChat } from '../../../api/types/outgoing/chat';
import { ChatOffIcon } from '../../../assets/icons';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { selectChatEnabledState } from '../../../store/slices/chatSlice';
import MoreMenuItem from './MoreMenuItem';

interface ToggleChatMenuItemProps {
  onClose: () => void;
}

const ToggleChatMenuItem = ({ onClose }: ToggleChatMenuItemProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isChatEnabled = useAppSelector(selectChatEnabledState);

  if (isChatEnabled) {
    return (
      <MoreMenuItem
        onClick={() => {
          onClose();
          dispatch(disableChat.action());
        }}
      >
        <ListItemIcon>
          <ChatOffIcon />
        </ListItemIcon>
        <Typography variant="inherit" noWrap>
          {t('more-menu-disable-chat')}
        </Typography>
      </MoreMenuItem>
    );
  }

  return (
    <MoreMenuItem
      onClick={() => {
        onClose();
        dispatch(enableChat.action());
      }}
    >
      <ListItemIcon>
        <ChatIcon />
      </ListItemIcon>
      <Typography variant="inherit" noWrap>
        {t('more-menu-enable-chat')}
      </Typography>
    </MoreMenuItem>
  );
};

export default ToggleChatMenuItem;
