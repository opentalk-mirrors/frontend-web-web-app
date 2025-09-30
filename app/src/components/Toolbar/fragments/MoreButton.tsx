// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { MoreIcon } from '../../../assets/icons';
import { ToolbarButtonIds } from '../../../constants';
import { useAppSelector } from '../../../hooks';
import { selectIsRoomDeleted } from '../../../store/slices/roomSlice';
import MoreMenu from './MoreMenu';
import ToolbarButton from './ToolbarButton';

const MenuButton = () => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const isRoomDeleted = useAppSelector(selectIsRoomDeleted);

  const closeMenu = () => {
    setShowMenu(false);
  };
  const openMenu = () => {
    setShowMenu(true);
  };

  return (
    <div ref={menuRef}>
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
      <MoreMenu onClose={closeMenu} anchorEl={menuRef.current} open={showMenu} />
    </div>
  );
};

export default MenuButton;
