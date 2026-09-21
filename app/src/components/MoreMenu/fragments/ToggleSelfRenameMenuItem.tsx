// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ListItemIcon, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { disableSelfRename, enableSelfRename } from '../../../api/types/outgoing/moderation';
import { EditIcon, EditOffIcon } from '../../../assets/icons';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { selectSelfRenameEnabled } from '../../../store/slices/moderationSlice';
import { selectAllModeratorParticipants } from '../../../store/slices/participantsSlice';
import { selectOurUuid } from '../../../store/slices/userSlice';
import { ParticipantId } from '../../../types';
import MoreMenuItem from './MoreMenuItem';

interface ToggleSelfRenameMenuItemProps {
  onClose: () => void;
}

const ToggleSelfRenameMenuItem = ({ onClose }: ToggleSelfRenameMenuItemProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const participantId = useAppSelector(selectOurUuid);
  const moderatorParticipants = useAppSelector(selectAllModeratorParticipants);
  const hasSelfRenameEnabled = useAppSelector(selectSelfRenameEnabled);
  const unrestrictedParticipants = moderatorParticipants
    .map((participant) => participant.id as ParticipantId)
    .concat(participantId ? [participantId] : []);

  if (hasSelfRenameEnabled) {
    return (
      <MoreMenuItem
        onClick={() => {
          onClose();
          dispatch(disableSelfRename.action({ unrestrictedParticipants }));
        }}
      >
        <ListItemIcon>
          <EditOffIcon />
        </ListItemIcon>
        <Typography variant="inherit" noWrap>
          {t('more-menu-enable-display-name-change-restrictions')}
        </Typography>
      </MoreMenuItem>
    );
  }

  return (
    <MoreMenuItem
      onClick={() => {
        onClose();
        dispatch(enableSelfRename.action());
      }}
    >
      <ListItemIcon>
        <EditIcon />
      </ListItemIcon>
      <Typography variant="inherit" noWrap>
        {t('more-menu-disable-display-name-change-restrictions')}
      </Typography>
    </MoreMenuItem>
  );
};

export default ToggleSelfRenameMenuItem;
