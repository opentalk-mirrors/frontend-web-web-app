// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Grid, Theme, Typography, styled } from '@mui/material';
import { uniq } from 'lodash';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { SecureIcon as DefaultSecureIcon, DoneIcon } from '../../assets/icons';
import { useAppSelector } from '../../hooks';
import { selectCombinedParticipantsAndUser } from '../../store/selectors';
import { Participant, ParticipationKind } from '../../types';
import PopoverButton from '../PopoverButton.tsx/PopoverButton';

const getColor = (theme: Theme, warning?: boolean) =>
  warning ? theme.palette.warning.main : theme.palette.primary.main;

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

const CheckmarkIconBig = styled(DoneIcon)<{ warning?: boolean }>(({ theme, warning }) => ({
  color: getColor(theme, warning),
  width: '3rem',
  height: '3rem',
  padding: theme.spacing(1),
}));

const PopoverParagraph = styled(Typography)(({ theme }) => ({
  fontWeight: 'lighter',
  marginTop: theme.spacing(2),
}));

const CenteredGrid = styled(Grid)(() => ({ textAlign: 'center' }));

const isParticipantUnsafe = (participant: Participant) =>
  participant.participationKind === ParticipationKind.Guest || participant.participationKind === ParticipationKind.Sip;

const SecurityBadge = () => {
  const allParticipants = useAppSelector(selectCombinedParticipantsAndUser);
  const unsafeParticipantKinds = useMemo(
    () => uniq(allParticipants.filter(isParticipantUnsafe).map((participant) => participant.participationKind)),
    [allParticipants]
  );
  const isUnsafeParticipantConnected = unsafeParticipantKinds.length > 0;
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

  const renderWarningPopoverContent = () => (
    <Grid
      container
      spacing={2}
      columns={6}
      sx={{
        width: '24rem',
        alignItems: 'center',
      }}
    >
      <Grid size={{ xs: 2 }}>
        <SecureIconBig warning />
      </Grid>
      <Grid size={{ xs: 4 }}>
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
        width: '24rem',
        alignItems: 'center',
      }}
    >
      <CenteredGrid size={{ xs: 2 }}>
        <SecureIconBig />
      </CenteredGrid>
      <Grid size={{ xs: 4 }}>
        <Typography>{t('secure-connection-message')}</Typography>
      </Grid>
      <CenteredGrid size={{ xs: 2 }}>
        <CheckmarkIconBig />
      </CenteredGrid>
      <Grid size={{ xs: 4 }}>
        <Typography>{t('secure-connection-registered-only')}</Typography>
      </Grid>
      <CenteredGrid size={{ xs: 2 }}>
        <CheckmarkIconBig />
      </CenteredGrid>
      <Grid size={{ xs: 4 }}>
        <Typography>{t('secure-connection-no-sip')}</Typography>
      </Grid>
    </Grid>
  );

  return (
    <PopoverButton
      icon={<SecureIconSmall warning={isUnsafeParticipantConnected} />}
      content={isUnsafeParticipantConnected ? renderWarningPopoverContent() : renderSecurePopoverContent()}
      buttonLabel={t('secure-connection-button-label')}
      titleLabel="secure-connection-title"
      popoverTitleId="secure-connection-title-id"
    />
  );
};

export default SecurityBadge;
