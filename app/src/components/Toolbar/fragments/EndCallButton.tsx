// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { selectIsAuthenticated } from '@opentalk/redux-oidc';
import { EventId, RoomId } from '@opentalk/rest-api-rtk-query';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { useGetEventQuery, useGetMeQuery, useGetRoomQuery } from '../../../api/rest';
import { EndCallIcon } from '../../../assets/icons';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { useFullscreenContext } from '../../../hooks/useFullscreenContext';
import { hangUp } from '../../../store/commonActions';
import { selectEventInfo } from '../../../store/slices/roomSlice';
import { isRegisteredUser } from '../../../utils/typeGuardUtils';
import CloseMeetingDialog from '../../CloseMeetingDialog';
import { ToolbarButtonIds } from '../Toolbar';
import ToolbarButton from './ToolbarButton';

const EndCallButton = () => {
  const { t } = useTranslation();
  const { roomId } = useParams<'roomId'>() as {
    roomId: RoomId;
  };

  const isLoggedInUser = useAppSelector(selectIsAuthenticated);
  const { data: me } = useGetMeQuery(undefined, { skip: !isLoggedInUser });
  const { data: roomData } = useGetRoomQuery(roomId, { skip: !isLoggedInUser });
  const dispatch = useAppDispatch();

  const [isConfirmDialogVisible, showConfirmDialog] = useState(false);
  const isMeetingCreator =
    roomData?.createdBy && isRegisteredUser(roomData.createdBy) && me?.id === roomData.createdBy.id;
  const eventInfo = useAppSelector(selectEventInfo);
  const requiresConfirmDialog = isMeetingCreator && !eventInfo?.isAdhoc;
  const fullscreenContext = useFullscreenContext();
  const { data: eventData } = useGetEventQuery({ eventId: eventInfo?.id as EventId }, { skip: !requiresConfirmDialog });

  const hangUpHandler = useCallback(() => dispatch(hangUp()), [dispatch]);

  const handleEndCall = () => {
    if (requiresConfirmDialog) {
      showConfirmDialog(true);
      fullscreenContext.setHasActiveOverlay(true);
    } else {
      hangUpHandler();
    }
  };

  return (
    <>
      <ToolbarButton
        tooltipTitle={t('toolbar-button-end-call-tooltip-title')}
        onClick={handleEndCall}
        active={false}
        data-testid="toolbarEndCallButton"
        color="error"
        id={ToolbarButtonIds.EndCall}
      >
        <EndCallIcon />
      </ToolbarButton>

      {isConfirmDialogVisible && (
        <CloseMeetingDialog
          open={isConfirmDialogVisible}
          onClose={() => showConfirmDialog(false)}
          container={fullscreenContext.rootElement}
          eventData={eventData}
        />
      )}
    </>
  );
};

export default EndCallButton;
