// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Grid, Typography, styled } from '@mui/material';
import { uniq } from 'lodash';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from '../../hooks';
import { selectCombinedParticipantsAndUser } from '../../store/selectors';
import { selectE2EEncryption } from '../../store/slices/roomSlice';
import { Participant, ParticipationKind } from '../../types';
import PopoverButton from '../PopoverButton.tsx/PopoverButton';
import {
  CheckmarkIconBig,
  SecureIconBig,
  SecureIconSmall,
  SecureFilledIconBig,
  SecureFilledIconSmall,
} from './fragments/SecurityBadgeIcons';

const PopoverParagraph = styled(Typography)(({ theme }) => ({
  fontWeight: 'lighter',
  marginTop: theme.spacing(2),
}));

const CenteredGrid = styled(Grid)(() => ({ textAlign: 'center' }));

const isParticipantUnsafe = (participant: Participant) =>
  participant.participationKind === ParticipationKind.Guest ||
  participant.participationKind === ParticipationKind.CallIn;

const SecurityBadge = () => {
  const allParticipants = useAppSelector(selectCombinedParticipantsAndUser);
  const unsafeParticipantKinds = useMemo(
    () => uniq(allParticipants.filter(isParticipantUnsafe).map((participant) => participant.participationKind)),
    [allParticipants]
  );

  const highSecurityEnabled = useAppSelector(selectE2EEncryption);
  const isUnsafeParticipantConnected = unsafeParticipantKinds.length > 0;

  const { t } = useTranslation();

  const getBadgeTranslationKey = () => {
    if (
      unsafeParticipantKinds.includes(ParticipationKind.Guest) &&
      unsafeParticipantKinds.includes(ParticipationKind.CallIn)
    ) {
      return 'secure-connection-contaminated';
    }
    if (unsafeParticipantKinds.includes(ParticipationKind.Guest)) {
      return 'secure-connection-guests';
    }
    if (unsafeParticipantKinds.includes(ParticipationKind.CallIn)) {
      return 'secure-connection-sip';
    }
    //ideally this case should not be reached, ever
    return '';
  };
  const CheckmarkLine = ({ translationKey }: { translationKey: string }) => (
    <>
      <CenteredGrid size={{ xs: 2 }}>
        <CheckmarkIconBig />
      </CenteredGrid>
      <Grid size={{ xs: 4 }}>
        <Typography>{t(translationKey)}</Typography>
      </Grid>
    </>
  );

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
      <CheckmarkLine translationKey="secure-connection-registered-only" />
      <CheckmarkLine translationKey="secure-connection-no-sip" />
    </Grid>
  );

  const renderVerySecurePopoverContent = () => (
    <Grid
      container
      columns={6}
      sx={{
        width: '24rem',
        alignItems: 'center',
      }}
    >
      <CenteredGrid size={{ xs: 2 }}>
        <SecureFilledIconBig />
      </CenteredGrid>
      <Grid size={{ xs: 4 }}>
        <Typography>{t('secure-connection-message')}</Typography>
      </Grid>
      <CheckmarkLine translationKey="secure-connection-registered-only" />
      <CheckmarkLine translationKey="secure-connection-no-sip" />
      <CheckmarkLine translationKey="secure-connection-high-security" />
    </Grid>
  );
  const determineBadgeToShow = () => {
    if (highSecurityEnabled) {
      return renderVerySecurePopoverContent();
    }
    if (isUnsafeParticipantConnected) {
      return renderWarningPopoverContent();
    }
    return renderSecurePopoverContent();
  };
  return (
    <PopoverButton
      icon={
        highSecurityEnabled ? <SecureFilledIconSmall /> : <SecureIconSmall warning={isUnsafeParticipantConnected} />
      }
      content={determineBadgeToShow()}
      buttonLabel={t('secure-connection-button-label')}
      titleLabel="secure-connection-title"
      popoverTitleId="secure-connection-title-id"
    />
  );
};

export default SecurityBadge;
