// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Popover, Stack, styled } from '@mui/material';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BurgermenuIcon } from '../../../assets/icons';
import { IconButton } from '../../../commonComponents';
import { MY_MEETING_MENU_BUTTON_ID } from '../../../constants';
import { SupportList } from '../../SupportList/SupportList';

const ViewPopperContainer = styled(Stack)(({ theme }) => ({
  position: 'relative',
  background: theme.palette.background.video,
  borderRadius: '0.25rem',
  maxWidth: '60px',
  float: 'right',
  justifyContent: 'center',
  alignItems: 'center',
  '& .MuiPopover-paper': {
    marginTop: '0.3rem',
    background: theme.palette.background.defaultGradient,
  },
}));

const StyledPopover = styled(Popover)(() => ({
  marginTop: '5px',
}));

const BurgerIconButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(1),
  '& .MuiSvgIcon-root': {
    fontSize: theme.typography.pxToRem(24),
  },
}));

const StyledSupportList = styled(SupportList)(({ theme }) => ({
  background: theme.palette.background.video,
  '& .MuiButtonBase-root:hover': {
    background: theme.palette.secondary.lighter,
  },
}));

const MyMeetingMenu = () => {
  const { t } = useTranslation();
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const isMenuOpen = Boolean(anchorElement);
  const myMeetingMenuRef = useRef(null);

  return (
    <>
      <ViewPopperContainer ref={myMeetingMenuRef}>
        <BurgerIconButton
          aria-expanded={isMenuOpen}
          aria-haspopup="true"
          id={MY_MEETING_MENU_BUTTON_ID}
          aria-controls={isMenuOpen ? 'my-meeting-menu' : undefined}
          aria-label={t('my-meeting-menu')}
          onClick={(event) => setAnchorElement(event.currentTarget)}
        >
          <BurgermenuIcon />
        </BurgerIconButton>
        <StyledPopover
          open={isMenuOpen}
          anchorEl={anchorElement}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          onClose={() => setAnchorElement(null)}
        >
          <StyledSupportList
            icons
            menu
            menuListProps={{
              id: 'my-meeting-menu',
              'aria-labelledby': MY_MEETING_MENU_BUTTON_ID,
              autoFocusItem: isMenuOpen,
              disablePadding: true,
              dense: true,
            }}
          />
        </StyledPopover>
      </ViewPopperContainer>
    </>
  );
};

export default MyMeetingMenu;
