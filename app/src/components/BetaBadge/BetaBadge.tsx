// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ThemeProvider, styled, Link, Popover, Container, Typography } from '@mui/material';
import React, { useRef } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { createOpenTalkTheme } from '../../assets/themes/opentalk';
import { useAppSelector } from '../../hooks';
import { selectBetaBadgeUrl, selectErrorReportEmail } from '../../store/slices/configSlice';

const Badge = styled('span')(({ theme }) => ({
  background: theme.palette.primary.main,
  transform: 'rotate(-45deg) scale(1) skew(0deg) translate(-12px)',
  position: 'absolute',
  top: theme.spacing(0),
  left: theme.spacing(-2),
  zIndex: theme.zIndex.fab,
  padding: theme.spacing(0, 4),
  color: theme.palette.secondary.main,
  textDecoration: 'none',
}));

const BetaBadge = () => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const reportEmail = useAppSelector(selectErrorReportEmail);
  const badgeUrl = useAppSelector(selectBetaBadgeUrl);
  const badgeRef = useRef(null);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <ThemeProvider theme={createOpenTalkTheme('light')}>
      <Badge onMouseEnter={handlePopoverOpen} ref={badgeRef}>
        {t('global-beta')}
      </Badge>
      <Popover
        onClose={handlePopoverClose}
        open={open}
        anchorEl={badgeRef.current}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
      >
        <Container
          data-testid="beta-badge-content-container"
          maxWidth="xs"
          sx={{ py: 2 }}
          onMouseLeave={handlePopoverClose}
        >
          <Typography variant="body2">
            <Trans
              i18nKey="beta-flag-tooltip-text"
              values={{ reportEmail }}
              components={{
                reportEmailLink: <Link href={`mailto:${reportEmail}`} />,
                demoLink: badgeUrl ? <Link href={badgeUrl} target="_blank" /> : <span />,
              }}
            />
          </Typography>
        </Container>
      </Popover>
    </ThemeProvider>
  );
};

export default BetaBadge;
