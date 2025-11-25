// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { selectIsAuthenticated } from '@opentalk/redux-oidc';
import { SnackbarKey } from 'notistack';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import BreakoutRoomIcon from '../../assets/images/subroom-illustration.svg?react';
import { notifications } from '../../commonComponents';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { useInviteCode } from '../../hooks/useInviteCode';
import { startRoom } from '../../store/commonActions';
import {
  breakoutSlice,
  selectAssignedBreakoutRoomId,
  selectCurrentBreakoutRoomId,
  selectLastDispatchedActionType,
} from '../../store/slices/breakoutSlice';
import { selectRoomId, selectRoomPassword } from '../../store/slices/roomSlice';
import { selectDisplayName } from '../../store/slices/userSlice';
import { composeRoomPath } from '../../utils/apiUtils';
import BreakoutRoomNotification, { Action } from './fragments/BreakoutRoomNotification';

const BreakoutRoomProvider = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const assignedBreakoutRoomId = useAppSelector(selectAssignedBreakoutRoomId);
  const currentBreakoutRoomId = useAppSelector(selectCurrentBreakoutRoomId);
  const isLoggedIn = useAppSelector(selectIsAuthenticated);
  const roomPassword = useAppSelector(selectRoomPassword);
  const roomId = useAppSelector(selectRoomId);
  const inviteCode = useInviteCode();
  const visibleNotifications = useRef<SnackbarKey[]>([]);
  const lastDispatchedActionType = useAppSelector(selectLastDispatchedActionType);
  const displayName = useAppSelector(selectDisplayName);
  const navigate = useNavigate();

  const handleJoinBreakoutRoom = useCallback(() => {
    if (roomId === undefined) {
      throw new Error('roomid is unset when joining breakout room');
    }
    dispatch(
      startRoom({
        roomId,
        password: roomPassword,
        breakoutRoomId: assignedBreakoutRoomId,
        displayName,
        inviteCode: isLoggedIn ? undefined : inviteCode,
      })
    ).then(() => navigate(composeRoomPath(roomId, inviteCode, assignedBreakoutRoomId)));
  }, [dispatch, isLoggedIn, roomId, roomPassword, displayName, assignedBreakoutRoomId, navigate, inviteCode]);

  const handleLeaveBreakoutRoom = useCallback(() => {
    if (roomId === undefined) {
      throw new Error('roomid is unset when leaving breakout room');
    }
    dispatch(
      startRoom({
        roomId,
        password: roomPassword,
        breakoutRoomId: null,
        displayName,
        inviteCode: isLoggedIn ? undefined : inviteCode,
      })
    ).then(() => navigate(composeRoomPath(roomId, inviteCode)));
  }, [dispatch, isLoggedIn, roomId, roomPassword, inviteCode, displayName, navigate]);

  const joinActions: Action[] = useMemo(
    () => [
      {
        text: t('breakout-room-notification-button-join'),
        onClick: handleJoinBreakoutRoom,
      },
    ],
    [t, handleJoinBreakoutRoom]
  );

  const leaveActions: Action[] = useMemo(
    () => [
      {
        text: t('breakout-room-notification-button-leave'),
        onClick: handleLeaveBreakoutRoom,
      },
    ],
    [t, handleLeaveBreakoutRoom]
  );

  const clearVisibleNotifications = () => {
    visibleNotifications.current.forEach((key) => {
      notifications.close(key);
    });
    visibleNotifications.current = [];
  };

  useEffect(() => {
    clearVisibleNotifications();
    switch (lastDispatchedActionType) {
      case breakoutSlice.actions.stopped.type:
      case breakoutSlice.actions.expired.type:
        currentBreakoutRoomId !== null &&
          notifications.info(t('breakout-room-notification-stopped'), {
            persist: true,
            content: (key, message) => {
              visibleNotifications.current.push(key);
              return (
                <BreakoutRoomNotification
                  snackbarKey={key}
                  message={message}
                  iconComponent={BreakoutRoomIcon}
                  actions={leaveActions}
                  countdown={{
                    action: handleLeaveBreakoutRoom,
                    duration: 60,
                    startedAt: Date.now(),
                  }}
                />
              );
            },
          });
        break;
      case breakoutSlice.actions.started.type:
        notifications.info(t('breakout-room-notification-started'), {
          persist: true,
          content: (key, message) => {
            visibleNotifications.current.push(key);
            return (
              <BreakoutRoomNotification
                snackbarKey={key}
                message={message}
                iconComponent={BreakoutRoomIcon}
                actions={joinActions}
                countdown={{
                  action: handleJoinBreakoutRoom,
                  duration: 60,
                  startedAt: Date.now(),
                }}
              />
            );
          },
        });
        break;
    }
  }, [
    t,
    joinActions,
    leaveActions,
    lastDispatchedActionType,
    handleLeaveBreakoutRoom,
    handleJoinBreakoutRoom,
    currentBreakoutRoomId,
  ]);

  return <>{children}</>;
};

export default BreakoutRoomProvider;
