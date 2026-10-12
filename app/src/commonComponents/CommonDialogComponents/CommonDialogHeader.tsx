// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, DialogTitle, styled } from '@mui/material';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { CloseIcon } from '../../assets/icons';
import IconButton from '../IconButtons/IconButton';

const HeaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  padding: theme.spacing(1, 3),
  gap: theme.spacing(2),
}));

const IconContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginRight: theme.spacing(1),
}));

const Title = styled(DialogTitle)({
  padding: 0,
  flexGrow: 1,
});

const CloseButton = styled(IconButton)(({ theme }) => ({
  marginRight: theme.spacing(-1),
}));

type CommonDialogHeaderProps = {
  closeMenu: () => void;
  titleKey: string;
  icon?: ReactNode;
};
const CommonDialogHeader = ({ closeMenu, titleKey, icon }: CommonDialogHeaderProps) => {
  const { t } = useTranslation();
  return (
    <HeaderContainer>
      {icon && <IconContainer aria-hidden="true">{icon}</IconContainer>}
      <Title>{t(titleKey)}</Title>
      <CloseButton size="small" onClick={closeMenu} aria-label={t('global-close-dialog')}>
        <CloseIcon />
      </CloseButton>
    </HeaderContainer>
  );
};

export default CommonDialogHeader;
