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

const Title = styled(Typography)({
  flex: 1,
  fontSize: '1.25rem',
  margin: 0,
});

const TitleIcon = styled('span')({
  display: 'flex',
  '& svg': {
    width: '1.25rem',
    height: '1.25rem',
  },
});

const SidePanelHeader = ({ title, onClose, icon, onBack }: SidePanelHeaderProps) => {
  const { t } = useTranslation();

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', pb: 2 }}>
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
    </Stack>
  );
};

export default SidePanelHeader;
