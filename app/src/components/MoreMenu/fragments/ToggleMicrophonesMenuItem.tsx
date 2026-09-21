// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ListItemIcon, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import {
  disableMicrophoneRestrictions,
  enableMicrophoneRestrictions,
  mute,
} from '../../../api/types/outgoing/moderation';
import { MicOffIcon, MicOnIcon } from '../../../assets/icons';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { selectMicrophonesEnabled } from '../../../store/slices/moderationSlice';
import { selectAllModeratorParticipants } from '../../../store/slices/participantsSlice';
import { selectOurUuid } from '../../../store/slices/userSlice';
import { ParticipantId } from '../../../types';
import MoreMenuItem from './MoreMenuItem';

interface ToggleMicrophonesMenuItemProps {
  onClose: () => void;
}

const ToggleMicrophonesMenuItem = ({ onClose }: ToggleMicrophonesMenuItemProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const participantId = useAppSelector(selectOurUuid);
  const moderatorParticipants = useAppSelector(selectAllModeratorParticipants);
  const hasMicrophonesEnabled = useAppSelector(selectMicrophonesEnabled);
  const unrestrictedParticipants = moderatorParticipants
    .map((participant) => participant.id as ParticipantId)
    .concat(participantId ? [participantId] : []);

  if (hasMicrophonesEnabled) {
    return (
      <MoreMenuItem
        onClick={() => {
          if (!participantId) {
            return;
          }
          onClose();
          dispatch(enableMicrophoneRestrictions.action({ unrestrictedParticipants }));
          dispatch(mute.action({ participants: moderatorParticipants.map((participant) => participant.id) }));
        }}
      >
        <ListItemIcon>
          <MicOffIcon />
        </ListItemIcon>
        <Typography variant="inherit" noWrap>
          {t('more-menu-disable-microphones')}
        </Typography>
      </MoreMenuItem>
    );
  }

  return (
    <MoreMenuItem
      onClick={() => {
        onClose();
        dispatch(disableMicrophoneRestrictions.action());
      }}
    >
      <ListItemIcon>
        <MicOnIcon />
      </ListItemIcon>
      <Typography variant="inherit" noWrap>
        {t('more-menu-enable-microphones')}
      </Typography>
    </MoreMenuItem>
  );
};

export default ToggleMicrophonesMenuItem;
