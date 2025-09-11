// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Chip, Tooltip, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { InfoIcon } from '../../../assets/icons';

const CustomChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'collapsed',
})<{ collapsed: boolean }>(({ theme, collapsed }) => ({
  padding: collapsed ? '0' : undefined,
  borderColor: theme.palette.text.primary,
  transition: 'padding 300ms ease-out',

  '& > .MuiChip-icon': {
    margin: 0,
    zIndex: 2,
    width: '2rem',
    fill: theme.palette.text.primary,
  },

  '& > span': {
    fontSize: '0.75rem',
    zIndex: 1,
    maxWidth: collapsed ? '0' : '20rem',
    transition: 'max-width 300ms ease-out',
    padding: 0,
    color: theme.palette.text.primary,
  },
}));

interface VersionBadgeProps {
  collapsed: boolean;
}

const VersionBadge = (props: VersionBadgeProps) => {
  const { t } = useTranslation();
  const version = window.config.version?.product || t('dev-version');

  return (
    <Tooltip title={t('version-label', { version })}>
      <CustomChip
        aria-label={t('version-label', { version })}
        label={version}
        variant="outlined"
        icon={<InfoIcon />}
        collapsed={props.collapsed}
      />
    </Tooltip>
  );
};

export default VersionBadge;
