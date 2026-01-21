// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SnackbarKey } from 'notistack';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { switchRoom } from '../../api/types/outgoing/breakout';
import BreakoutRoomIcon from '../../assets/images/subroom-illustration.svg?react';
import { notifications } from '../../commonComponents';
import { useAppDispatch, useAppSelector } from '../../hooks';
import {
  breakoutSlice,
  selectAssignedBreakoutRoomId,
  selectCurrentBreakoutRoomId,
  selectLastDispatchedActionType,
} from '../../store/slices/breakoutSlice';
import { RoomKind } from '../../types';
import BreakoutRoomNotification, { Action } from './fragments/BreakoutRoomNotification';

const BreakoutRoomProvider = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const assignedBreakoutRoomId = useAppSelector(selectAssignedBreakoutRoomId);
  const currentBreakoutRoomId = useAppSelector(selectCurrentBreakoutRoomId);
  const visibleNotifications = useRef<SnackbarKey[]>([]);
  const lastDispatchedActionType = useAppSelector(selectLastDispatchedActionType);

  const handleJoinBreakoutRoom = useCallback(() => {
    if (assignedBreakoutRoomId === undefined) {
      throw new Error('roomId is unset when joining breakout room');
    }
    dispatch(
      switchRoom.action({
        kind: RoomKind.Breakout,
        id: assignedBreakoutRoomId,
      })
    );
  }, [assignedBreakoutRoomId, dispatch]);

  const handleLeaveBreakoutRoom = useCallback(() => {
    dispatch(
      switchRoom.action({
        kind: RoomKind.Main,
        id: undefined,
      })
    );
  }, [dispatch]);

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
      case breakoutSlice.actions.closed.type:
        currentBreakoutRoomId &&
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
