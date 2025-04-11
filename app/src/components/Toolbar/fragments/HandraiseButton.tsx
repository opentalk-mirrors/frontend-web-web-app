// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useTranslation } from 'react-i18next';

import { lowerHand, raiseHand } from '../../../api/types/outgoing/control';
import { RaiseHandOffIcon, RaiseHandOnIcon } from '../../../assets/icons';
import { ToolbarButtonIds } from '../../../constants';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { selectHandUp, selectRaiseHandsEnabled } from '../../../store/slices/moderationSlice';
import { selectIsRoomDeleted } from '../../../store/slices/roomSlice';
import ToolbarButton from './ToolbarButton';

const HandraiseButton = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const hasHandUp = useAppSelector(selectHandUp);
  const hasHandraisesEnabled = useAppSelector(selectRaiseHandsEnabled);
  const isRoomDeleted = useAppSelector(selectIsRoomDeleted);

  const toggleRaisedHand = () => {
    hasHandUp ? dispatch(lowerHand.action()) : dispatch(raiseHand.action());
  };

  const renderTooltipText = () => {
    if (!hasHandraisesEnabled) {
      return 'toolbar-button-handraises-disabled';
    }
    return hasHandUp ? 'toolbar-button-lower-hand-tooltip-title' : 'toolbar-button-raise-hand-tooltip-title';
  };

  return (
    <ToolbarButton
      tooltipTitle={t(renderTooltipText())}
      active={hasHandUp}
      onClick={toggleRaisedHand}
      data-testid="toolbarHandraiseButton"
      disabled={!hasHandraisesEnabled || isRoomDeleted}
      id={ToolbarButtonIds.Handraise}
    >
      {hasHandUp ? <RaiseHandOnIcon /> : <RaiseHandOffIcon />}
    </ToolbarButton>
  );
};

export default HandraiseButton;
