// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { MenuItem, MenuItemOwnProps, styled, Typography, SvgIcon } from '@mui/material';
import { KeyboardEventHandler } from 'react';
import { useTranslation } from 'react-i18next';

import { DoneIcon } from '../../../assets/icons';

const ContainerMenuItem = styled(MenuItem)({
  justifyContent: 'space-between',
  '& .MuiTypography-root': {
    fontWeight: 400,
  },
});

const DoneIconStyledWrapper = styled(SvgIcon, {
  shouldForwardProp: (prop) => prop !== 'isActive',
})<{ isActive: boolean | undefined }>(({ theme, isActive }) => ({
  marginLeft: theme.spacing(1),
  '& svg': { fill: isActive ? theme.palette.primary.light : 'transparent' },
}));

interface SortPopoverMenuItemProps extends Omit<MenuItemOwnProps, 'onSelect'> {
  i18nKey: string;
  selected?: boolean;
  value: string;
  onSelect(value: string): void;
}

const SortPopoverMenuItem = ({ i18nKey, selected, onSelect, value, ...props }: SortPopoverMenuItemProps) => {
  const { t } = useTranslation();

  const onClickHandler = () => {
    onSelect(value);
  };

  const preventPropagationOnSpaceKey: KeyboardEventHandler<HTMLLIElement> = (event) => {
    // Prevent conflict between selecting sorting option and push to talk.
    if (event.code === 'Space') {
      event.stopPropagation();
    }
  };

  return (
    <ContainerMenuItem
      {...props}
      onClick={onClickHandler}
      onKeyUp={preventPropagationOnSpaceKey}
      onKeyDown={preventPropagationOnSpaceKey}
    >
      <Typography>{t(i18nKey)}</Typography>
      <DoneIconStyledWrapper fontSize="inherit" isActive={selected}>
        <DoneIcon />
      </DoneIconStyledWrapper>
    </ContainerMenuItem>
  );
};

export default SortPopoverMenuItem;
