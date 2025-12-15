// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { MoreIcon } from '../../../assets/icons';
import { ToolbarButtonIds } from '../../../constants';
import { useAppSelector } from '../../../hooks';
import { selectIsRoomDeleted } from '../../../store/slices/roomSlice';
import MoreMenu from './MoreMenu';
import ToolbarButton from './ToolbarButton';

const MenuButton = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const { t } = useTranslation();
  const isRoomDeleted = useAppSelector(selectIsRoomDeleted);
  const handleMenuRef = useCallback((node: HTMLDivElement | null) => {
    setAnchorEl(node);
  }, []);

  const closeMenu = () => {
    setShowMenu(false);
  };
  const openMenu = () => {
    setShowMenu(true);
  };

  return (
    <div ref={handleMenuRef}>
      <ToolbarButton
        tooltipTitle={t('toolbar-button-more-tooltip-title')}
        active={showMenu}
        onClick={openMenu}
        data-testid="toolbarMenuButton"
        id={ToolbarButtonIds.More}
        disabled={isRoomDeleted}
      >
        <MoreIcon />
      </ToolbarButton>
      <MoreMenu onClose={closeMenu} anchorEl={anchorEl} open={showMenu} />
    </div>
  );
};

export default MenuButton;
