// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ListItemIcon, Typography } from '@mui/material';
import { BackendModules } from '@opentalk/rest-api-rtk-query';
import { useTranslation } from 'react-i18next';

import { disableReactionRestrictions, enableReactionRestrictions } from '../../../api/types/outgoing/reaction';
import ReactionOffIcon from '../../../assets/icons/ReactionOffIcon';
import ReactionOnIcon from '../../../assets/icons/ReactionOnIcon';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { selectIsModuleEnabled } from '../../../store/slices/configSlice';
import { selectReactionRestrictionsEnabled } from '../../../store/slices/reactionSlice';
import MoreMenuItem from './MoreMenuItem';

interface ToggleReactionRestrictionsMenuItemProps {
  onClose: () => void;
}

const ToggleReactionRestrictionsMenuItem = ({ onClose }: ToggleReactionRestrictionsMenuItemProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isReactionModuleEnabled = useAppSelector(selectIsModuleEnabled(BackendModules.Reaction));
  const reactionRestrictionsEnabled = useAppSelector(selectReactionRestrictionsEnabled);

  if (!isReactionModuleEnabled) {
    return null;
  }

  if (reactionRestrictionsEnabled) {
    return (
      <MoreMenuItem
        onClick={() => {
          onClose();
          dispatch(disableReactionRestrictions.action());
        }}
      >
        <ListItemIcon>
          <ReactionOnIcon />
        </ListItemIcon>
        <Typography variant="inherit" noWrap>
          {t('more-menu-enable-reaction')}
        </Typography>
      </MoreMenuItem>
    );
  }

  return (
    <MoreMenuItem
      onClick={() => {
        onClose();
        dispatch(enableReactionRestrictions.action({ unrestrictedParticipants: [] }));
      }}
    >
      <ListItemIcon>
        <ReactionOffIcon />
      </ListItemIcon>
      <Typography variant="inherit" noWrap>
        {t('more-menu-disable-reaction')}
      </Typography>
    </MoreMenuItem>
  );
};

export default ToggleReactionRestrictionsMenuItem;
