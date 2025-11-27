// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled, Link, Popover, Container, Typography } from '@mui/material';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { useAppSelector } from '../../hooks';
import { selectBetaBadgeUrl, selectErrorReportEmail } from '../../store/slices/configSlice';

const Badge = styled('span')(({ theme }) => ({
  background: theme.palette.secondary.main,
  transform: 'rotate(-45deg) scale(1) skew(0deg) translate(-12px)',
  position: 'absolute',
  top: theme.spacing(0),
  left: theme.spacing(-2),
  zIndex: theme.zIndex.fab,
  padding: theme.spacing(0, 4),
  color: theme.palette.secondary.contrastText,
  textDecoration: 'none',
}));

const Content = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
}));

const ContentLink = styled(Link)(({ theme }) => ({
  color: theme.palette.secondary.main,
  textDecoration: 'underline',
}));

const BetaBadge = () => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const reportEmail = useAppSelector(selectErrorReportEmail);
  const badgeUrl = useAppSelector(selectBetaBadgeUrl);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Badge onMouseEnter={handlePopoverOpen}>{t('global-beta')}</Badge>
      <Popover
        onClose={handlePopoverClose}
        open={open}
        anchorEl={anchorEl}
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
          <Content variant="body2">
            <Trans
              i18nKey="beta-flag-tooltip-text"
              values={{ reportEmail }}
              components={{
                reportEmailLink: <ContentLink href={`mailto:${reportEmail}`} />,
                demoLink: badgeUrl ? <ContentLink href={badgeUrl} target="_blank" /> : <span />,
              }}
            />
          </Content>
        </Container>
      </Popover>
    </>
  );
};

export default BetaBadge;
