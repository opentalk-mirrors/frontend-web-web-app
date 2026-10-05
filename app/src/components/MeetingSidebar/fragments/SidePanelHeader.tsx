// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { IconButton, Stack, Typography, styled } from '@mui/material';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { BackIcon, CloseIcon } from '../../../assets/icons';
import { SIDE_PANEL_TITLE_ID } from '../../../constants';

type SidePanelHeaderProps = {
  title: string;
  onClose: () => void;
  icon?: ReactNode;
  onBack?: () => void;
};

const Header = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  flexShrink: 0,
  gap: theme.spacing(1.5),
  height: theme.typography.pxToRem(64),
  padding: theme.spacing(0, 3),
  borderBottom: `1px solid ${theme.palette.background.main.primary}`,
}));

const Title = styled(Typography)(({ theme }) => ({
  flex: 1,
  fontSize: theme.typography.pxToRem(16),
  fontWeight: 600,
  lineHeight: 1.25,
  margin: 0,
}));

const TitleIcon = styled('span')(({ theme }) => ({
  display: 'flex',
  '& svg': {
    width: theme.typography.pxToRem(20),
    height: theme.typography.pxToRem(20),
  },
}));

const SidePanelHeader = ({ title, onClose, icon, onBack }: SidePanelHeaderProps) => {
  const { t } = useTranslation();

  return (
    <Header>
      {onBack && (
        <IconButton size="small" aria-label={t('side-panel-back-button-label')} onClick={onBack}>
          <BackIcon />
        </IconButton>
      )}
      {icon && <TitleIcon aria-hidden>{icon}</TitleIcon>}
      <Title id={SIDE_PANEL_TITLE_ID} variant="h3">
        {title}
      </Title>
      <IconButton aria-label={t('side-panel-close-button-label')} onClick={onClose}>
        <CloseIcon />
      </IconButton>
    </Header>
  );
};

export default SidePanelHeader;
