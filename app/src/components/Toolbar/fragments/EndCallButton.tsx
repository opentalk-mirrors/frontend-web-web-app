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
import { useFullscreenContext } from '../../../hooks/useFullscreenContext';
import { hangUp } from '../../../store/commonActions';
import { selectEventInfo } from '../../../store/slices/roomSlice';
import { isRegisteredUser } from '../../../utils/typeGuardUtils';
import CloseMeetingDialog from '../../CloseMeetingDialog';
import ToolbarButton from './ToolbarButton';

const HangupButton = styled(ToolbarButton)(({ theme }) => ({
  // We should always use theme.palette.error.main instead of hard-coding '#fe5f60'
  // but currently we wrap conference toolbar buttons into
  // light mode instead of dark for some reason. Therefore the palette color do not match.
  // Should be fixed during https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2096
  background: '#fe5f60',
  svg: {
    fill: theme.palette.common.white,
  },
  ':hover': {
    background: theme.palette.common.white,
    svg: {
      fill: '#fe5f60',
    },
  },
}));

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
          container={fullscreenContext.rootElement}
        />
      )}
    </>
  );
};

export default EndCallButton;
