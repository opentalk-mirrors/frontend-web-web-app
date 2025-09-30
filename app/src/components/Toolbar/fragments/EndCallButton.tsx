// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled } from '@mui/material';
import { selectIsAuthenticated } from '@opentalk/redux-oidc';
import { RoomId } from '@opentalk/rest-api-rtk-query';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { useGetMeQuery, useGetRoomQuery } from '../../../api/rest';
import { EndCallIcon } from '../../../assets/icons';
import { ToolbarButtonIds } from '../../../constants';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { hangUp } from '../../../store/commonActions';
import { selectFullscreenElement } from '../../../store/slices/fullscreen/slice';
import { selectEventInfo } from '../../../store/slices/roomSlice';
import { selectIsGuest } from '../../../store/slices/userSlice';
import { isRegisteredUser } from '../../../utils/typeGuardUtils';
import CloseMeetingDialog from '../../CloseMeetingDialog';
import ToolbarButton from './ToolbarButton';

const HangupButton = styled(ToolbarButton)(({ theme }) => ({
  background: theme.palette.danger.main,
  svg: {
    fill: theme.palette.danger.contrastText,
  },
  ':hover': {
    background: theme.palette.primary.main,
    svg: {
      fill: theme.palette.primary.contrastText,
    },
  },
}));

const EndCallButton = () => {
  const { t } = useTranslation();
  const { roomId } = useParams<'roomId'>() as {
    roomId: RoomId;
  };

  const isLoggedInUser = useAppSelector(selectIsAuthenticated);
  const isGuestUser = useAppSelector(selectIsGuest);
  const { data: me } = useGetMeQuery(undefined, { skip: !isLoggedInUser || isGuestUser });
  const { data: roomData } = useGetRoomQuery(roomId, { skip: !isLoggedInUser || isGuestUser });
  const dispatch = useAppDispatch();

  const [isConfirmDialogVisible, showConfirmDialog] = useState(false);
  const isMeetingCreator =
    roomData?.createdBy && isRegisteredUser(roomData.createdBy) && me?.id === roomData.createdBy.id;
  const eventInfo = useAppSelector(selectEventInfo);
  const requiresConfirmDialog = isMeetingCreator && !eventInfo?.isAdhoc;
  const fullscreenElement = useAppSelector(selectFullscreenElement);

  const hangUpHandler = useCallback(() => dispatch(hangUp()), [dispatch]);

  const handleEndCall = () => {
    if (requiresConfirmDialog) {
      showConfirmDialog(true);
    } else {
      hangUpHandler();
    }
  };

  return (
    <>
      <HangupButton
        tooltipTitle={t('toolbar-button-end-call-tooltip-title')}
        onClick={handleEndCall}
        active={false}
        data-testid="toolbarEndCallButton"
        id={ToolbarButtonIds.EndCall}
      >
        <EndCallIcon />
      </HangupButton>

      {isConfirmDialogVisible && (
        <CloseMeetingDialog
          open={isConfirmDialogVisible}
          onClose={() => showConfirmDialog(false)}
          container={fullscreenElement ?? null}
        />
      )}
    </>
  );
};

export default EndCallButton;
