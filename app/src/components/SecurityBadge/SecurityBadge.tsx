// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Grid, Typography, Popover, styled, Theme, IconButton } from '@mui/material';
import { uniq } from 'lodash';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SecureIcon as DefaultSecureIcon, DoneIcon } from '../../assets/icons';
import { VisuallyHiddenTitle } from '../../commonComponents';
import { useAppSelector } from '../../hooks';
import { selectCombinedParticipantsAndUser } from '../../store/selectors';
import { Participant, ParticipationKind } from '../../types';

const POPOVER_TITLE_ID = 'secure-connection-title-id';

const getColor = (theme: Theme, warning?: boolean) =>
  warning ? theme.palette.warning.main : theme.palette.primary.main;

const isParticipantUnsafe = (participant: Participant) =>
  participant.participationKind === ParticipationKind.Guest || participant.participationKind === ParticipationKind.Sip;

const SecureIconButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0.8),
  '& .MuiSvgIcon-root': {
    fontSize: theme.typography.pxToRem(25),
  },
}));

const SecureIconSmall = styled(DefaultSecureIcon, { shouldForwardProp: (prop) => prop !== 'warning' })<{
  warning?: boolean;
}>(({ theme, warning }) => ({
  color: getColor(theme, warning),
  '&.MuiSvgIcon-root': {
    fontSize: theme.typography.pxToRem(24),
  },
}));

const SecureIconBig = styled(DefaultSecureIcon, { shouldForwardProp: (prop) => prop !== 'warning' })<{
  warning?: boolean;
}>(({ theme, warning }) => ({
  color: getColor(theme, warning),
  width: '6rem',
  height: '6rem',
  padding: theme.spacing(1),
}));

const CheckmarkIconBig = styled(DoneIcon, { shouldForwardProp: (prop) => prop !== 'warning' })<{ warning?: boolean }>(
  ({ theme, warning }) => ({
    color: getColor(theme, warning),
    width: '3rem',
    height: '3rem',
    padding: theme.spacing(1),
  })
);

const SecureConnectionPopover = styled(Popover)(({ theme }) => ({
  '& .MuiPopover-paper': {
    backgroundColor: theme.palette.background.voteResult,
    padding: theme.spacing(1),
  },
  '& .MuiTypography-root': {
    pointerEvents: 'none',
  },
}));

const PopoverParagraph = styled(Typography)(({ theme }) => ({
  fontWeight: 'lighter',
  marginTop: theme.spacing(2),
}));

const CenteredGrid = styled(Grid)(() => ({ textAlign: 'center' }));

const SecurityBadge = () => {
  const allParticipants = useAppSelector(selectCombinedParticipantsAndUser);
  const unsafeParticipantKinds = useMemo(
    () => uniq(allParticipants.filter(isParticipantUnsafe).map((participant) => participant.participationKind)),
    [allParticipants]
  );
  const isUnsafeParticipantConnected = unsafeParticipantKinds.length > 0;

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const { t } = useTranslation();

  const getBadgeTranslationKey = () => {
    if (
      unsafeParticipantKinds.includes(ParticipationKind.Guest) &&
      unsafeParticipantKinds.includes(ParticipationKind.Sip)
    ) {
      return 'secure-connection-contaminated';
    }
    if (unsafeParticipantKinds.includes(ParticipationKind.Guest)) {
      return 'secure-connection-guests';
    }
    if (unsafeParticipantKinds.includes(ParticipationKind.Sip)) {
      return 'secure-connection-sip';
    }
    //ideally this case should not be reached, ever
    return '';
  };

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === ' ') event.stopPropagation();
  };

  const open = Boolean(anchorEl);

  const renderWarningPopoverContent = () => (
    <Grid
      container
      spacing={2}
      columns={6}
      sx={{
        maxWidth: '24rem',
        alignItems: 'center',
      }}
    >
      <Grid item xs={2}>
        <SecureIconBig warning />
      </Grid>
      <Grid item xs={4}>
        <Typography>{t('secure-connection-message')}</Typography>
        <PopoverParagraph>{t(getBadgeTranslationKey())}</PopoverParagraph>
      </Grid>
    </Grid>
  );
  const renderSecurePopoverContent = () => (
    <Grid
      container
      columns={6}
      sx={{
        maxWidth: '24rem',
        alignItems: 'center',
      }}
    >
      <CenteredGrid item xs={2}>
        <SecureIconBig />
      </CenteredGrid>
      <Grid item xs={4}>
        <Typography>{t('secure-connection-message')}</Typography>
      </Grid>
      <CenteredGrid item xs={2}>
        <CheckmarkIconBig />
      </CenteredGrid>
      <Grid item xs={4}>
        <Typography>{t('secure-connection-registered-only')}</Typography>
      </Grid>
      <CenteredGrid item xs={2}>
        <CheckmarkIconBig />
      </CenteredGrid>
      <Grid item xs={4}>
        <Typography>{t('secure-connection-no-sip')}</Typography>
      </Grid>
    </Grid>
  );

  return (
    <>
      <SecureIconButton
        onClick={open ? handlePopoverClose : handlePopoverOpen}
        aria-label={t('secure-connection-button-label')}
        onKeyDown={handleKeyDown}
      >
        <SecureIconSmall warning={isUnsafeParticipantConnected} />
      </SecureIconButton>
      <SecureConnectionPopover
        aria-labelledby={POPOVER_TITLE_ID}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        onClose={handlePopoverClose}
      >
        <VisuallyHiddenTitle label="secure-connection-title" component="h1" id={POPOVER_TITLE_ID} />
        {isUnsafeParticipantConnected ? renderWarningPopoverContent() : renderSecurePopoverContent()}
      </SecureConnectionPopover>
    </>
  );
};

export default SecurityBadge;
