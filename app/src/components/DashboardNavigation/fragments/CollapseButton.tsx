// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { BackIcon, ForwardIcon } from '../../../assets/icons';

const CustomButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'collapsed',
})<{ collapsed: boolean }>(({ theme }) => ({
  width: '2rem',
  height: '2rem',
  minWidth: 0,
  padding: theme.spacing(1),
  borderRadius: '100%',
  transition: 'all 200ms linear',

  '& svg': {
    width: '0.5em',
    height: '0.5em',
  },
}));

interface CollapseButtonProps {
  collapsed: boolean;
  onClick: (nextCollapsed: boolean) => void;
}

const CollapseButton = (props: CollapseButtonProps) => {
  const { t } = useTranslation();

  return (
    <CustomButton
      variant="outlined"
      color="inherit"
      collapsed={props.collapsed}
      onClick={props.onClick.bind(null, !props.collapsed)}
      aria-label={t(`dashboard-${props.collapsed ? 'open' : 'close'}-navbar`)}
      aria-expanded={!props.collapsed}
    >
      {props.collapsed ? <ForwardIcon /> : <BackIcon />}
    </CustomButton>
  );
};

export default CollapseButton;
