// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useTranslation } from 'react-i18next';

import { lowerHand, raiseHand } from '../../../api/types/outgoing/raiseHands';
import { RaiseHandOffIcon, RaiseHandOnIcon } from '../../../assets/icons';
import { ToolbarButtonIds } from '../../../constants';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { useHotkeyCombination } from '../../../hooks/useHotkeyCombination';
import { selectHandUp, selectRaiseHandsEnabled } from '../../../store/slices/moderationSlice';
import { selectIsRoomDeleted } from '../../../store/slices/roomSlice';
import ToolbarButton from './ToolbarButton';

const HandraiseButton = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const hasHandUp = useAppSelector(selectHandUp);
  const hasHandraisesEnabled = useAppSelector(selectRaiseHandsEnabled);
  const isRoomDeleted = useAppSelector(selectIsRoomDeleted);
  const keyCombination = useHotkeyCombination('hotkey-raise-hand-toggle');

  const toggleRaisedHand = () => {
    hasHandUp ? dispatch(lowerHand.action()) : dispatch(raiseHand.action());
  };

  const renderTooltipText = () => {
    if (!hasHandraisesEnabled) {
      return t('toolbar-button-handraises-disabled');
    }
    return hasHandUp ? t('toolbar-button-lower-hand-tooltip-title') : t('toolbar-button-raise-hand-tooltip-title');
  };

  return (
    <ToolbarButton
      tooltipTitle={renderTooltipText() + ` (${keyCombination})`}
      active={hasHandUp}
      onClick={toggleRaisedHand}
      data-testid="toolbarHandraiseButton"
      disabled={!hasHandraisesEnabled || isRoomDeleted}
      id={ToolbarButtonIds.Handraise}
    >
      {hasHandraisesEnabled ? <RaiseHandOnIcon /> : <RaiseHandOffIcon />}
    </ToolbarButton>
  );
};

export default HandraiseButton;
