// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled } from '@mui/material';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { EndCallIcon } from '../../../assets/icons';
import { ToolbarButtonIds } from '../../../constants';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { hangUp } from '../../../store/commonActions';
import { selectFullscreenElement } from '../../../store/slices/fullscreen/slice';
import { selectEventInfo, selectIsRoomOwner } from '../../../store/slices/roomSlice';
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
  const isRoomOwner = useAppSelector(selectIsRoomOwner);
  const dispatch = useAppDispatch();

  const [isConfirmDialogVisible, showConfirmDialog] = useState(false);
  const eventInfo = useAppSelector(selectEventInfo);
  const requiresConfirmDialog = isRoomOwner && !eventInfo?.isAdhoc;
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
