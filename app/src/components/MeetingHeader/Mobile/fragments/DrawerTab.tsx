// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled, Typography, Box, Stack } from '@mui/material';
import { ReactNode } from 'react';

import { Indicator } from '../../fragments/Indicator';

const TabHeader = styled(Stack)(({ theme }) => ({
  borderRadius: '1rem',
  padding: theme.spacing(1, 2),
  marginBottom: '0.5rem',
  borderWidth: '0.1rem',
  borderStyle: 'solid',
  borderColor: 'transparent',
}));

const Header = styled(TabHeader, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ theme, active }) => ({
  position: 'relative',
  background: active ? theme.palette.text.primary : theme.palette.background.defaultGradient,
  '& .MuiTypography-root': {
    color: active ? theme.palette.text.secondary : theme.palette.text.primary,
  },
  '& .MuiBadge-root': {
    top: '50%',
    right: '1rem',
  },
}));

const DisabledHeader = styled(TabHeader)(({ theme }) => ({
  backgroundColor: 'transparent',
  borderColor: theme.palette.background.light,
  '& .MuiTypography-root': {
    color: theme.palette.text.disabled,
  },
}));

const Content = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ theme, active }) =>
  !active
    ? {
        overflow: 'hidden',
        maxHeight: 0,
      }
    : {
        maxHeight: '80vh',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '0.5rem',
        padding: theme.spacing(1, 0),
      }
);

interface DrawerTabProps {
  children: ReactNode;
  tabTitle: string;
  active?: boolean;
  disabled?: boolean;
  handleClick: () => void;
  showIndicator?: boolean;
}

const TabIndicator = styled(Indicator)({
  marginLeft: '1rem',
  position: 'absolute',
  right: '0.1rem',
  top: '50%',
  transform: 'translateY(-50%)',
});

const DrawerTab = ({ children, tabTitle, active, disabled, handleClick, showIndicator }: DrawerTabProps) => {
  return (
    <Stack direction="column" component="li">
      {disabled ? (
        <DisabledHeader>
          <Typography>{tabTitle}</Typography>
        </DisabledHeader>
      ) : (
        <>
          <Header active={active} onClick={handleClick}>
            <Typography>{tabTitle}</Typography>
            {showIndicator && <TabIndicator />}
          </Header>
          <Content active={active}>{active && children}</Content>
        </>
      )}
    </Stack>
  );
};

export default DrawerTab;
