// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ListItemIcon, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { clearGlobalChatMessages } from '../../../api/types/outgoing/chat';
import { TrashIcon } from '../../../assets/icons';
import { useAppDispatch } from '../../../hooks';
import MoreMenuItem from './MoreMenuItem';

interface DeleteGlobalChatMenuItemProps {
  onClose: () => void;
}

const DeleteGlobalChatMenuItem = ({ onClose }: DeleteGlobalChatMenuItemProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  return (
    <MoreMenuItem
      onClick={() => {
        onClose();
        dispatch(clearGlobalChatMessages.action());
      }}
    >
      <ListItemIcon>
        <TrashIcon />
      </ListItemIcon>
      <Typography variant="inherit" noWrap>
        {t('more-menu-delete-global-chat')}
      </Typography>
    </MoreMenuItem>
  );
};

export default DeleteGlobalChatMenuItem;
