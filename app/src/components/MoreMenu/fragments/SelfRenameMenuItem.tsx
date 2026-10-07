// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ListItemIcon, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { EditIcon } from '../../../assets/icons';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { selectSelfRenameEnabled } from '../../../store/slices/moderationSlice';
import { setSelfRenameDialogVisible } from '../../../store/slices/uiSlice';
import { selectIsGuest } from '../../../store/slices/userSlice';
import MoreMenuItem from './MoreMenuItem';

const SelfRenameMenuItem = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isGuest = useAppSelector(selectIsGuest);
  const hasSelfRenameEnabled = useAppSelector(selectSelfRenameEnabled);

  if (!isGuest) {
    return null;
  }

  return (
    <MoreMenuItem
      disabled={!hasSelfRenameEnabled}
      onClick={() => {
        onClose();
        dispatch(setSelfRenameDialogVisible(true));
      }}
    >
      <ListItemIcon>
        <EditIcon />
      </ListItemIcon>
      <Typography variant="inherit" noWrap>
        {t('global-rename')}
      </Typography>
    </MoreMenuItem>
  );
};

export default SelfRenameMenuItem;
