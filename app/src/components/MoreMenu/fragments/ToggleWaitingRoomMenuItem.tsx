// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useTranslation } from 'react-i18next';

import { changeWaitingRoomState } from '../../../api/types/outgoing/moderation';
import { MeetingRoomIcon, NoMeetingRoomIcon } from '../../../assets/icons';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { selectFullscreenElement } from '../../../store/slices/fullscreen/slice';
import { selectGuestAccessEnabled, selectWaitingRoomState } from '../../../store/slices/moderationSlice';
import { WaitingRoom } from '../../../types/common';
import GuestAccessDisabledTooltip from './GuestAccessDisabledTooltip';
import SubmenuMenuItem, { type SubmenuEntry } from './SubMenuItem';

interface ToggleWaitingRoomMenuItemProps {
  onClose: () => void;
}

const ToggleWaitingRoomMenuItem = ({ onClose }: ToggleWaitingRoomMenuItemProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const waitingRoomState = useAppSelector(selectWaitingRoomState);
  const guestAccessEnabled = useAppSelector(selectGuestAccessEnabled);
  const fullScreenElement = useAppSelector(selectFullscreenElement);

  const submenu: Array<SubmenuEntry> = [
    {
      label: t('global-off'),
      selected: waitingRoomState === WaitingRoom.Disabled,
      action: () => {
        onClose();
        dispatch(changeWaitingRoomState.action({ newState: WaitingRoom.Disabled }));
      },
    },
    {
      label: t('global-for-all'),
      selected: waitingRoomState === WaitingRoom.ForAll,
      action: () => {
        onClose();
        dispatch(changeWaitingRoomState.action({ newState: WaitingRoom.ForAll }));
      },
    },
    {
      label: t('global-for-guests'),
      selected: waitingRoomState === WaitingRoom.ForGuests,
      disabled: !guestAccessEnabled,
      tooltip: guestAccessEnabled
        ? undefined
        : (children) => <GuestAccessDisabledTooltip>{children}</GuestAccessDisabledTooltip>,
      action: () => {
        onClose();
        dispatch(changeWaitingRoomState.action({ newState: WaitingRoom.ForGuests }));
      },
    },
  ];

  return (
    <SubmenuMenuItem
      label={t('more-menu-manage-waiting-room')}
      icon={waitingRoomState === WaitingRoom.Disabled ? <NoMeetingRoomIcon /> : <MeetingRoomIcon />}
      container={fullScreenElement}
      submenu={submenu}
    />
  );
};

export default ToggleWaitingRoomMenuItem;
