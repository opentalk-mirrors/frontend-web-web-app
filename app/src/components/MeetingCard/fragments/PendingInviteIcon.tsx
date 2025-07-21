// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled } from '@mui/material';
import { uniqueId } from 'lodash';
import { useTranslation } from 'react-i18next';

import { InviteIcon } from '../../../assets/icons';

const InviteContainer = styled('div')(({ theme }) => ({
  borderRadius: theme.borderRadius.large,
  background: theme.palette.warning.main,
  width: theme.typography.pxToRem(52),
  height: theme.typography.pxToRem(44),
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  '& svg': {
    fill: theme.palette.common.white,
  },
}));

export const PendingInviteIcon = () => {
  const { t } = useTranslation();

  return (
    <InviteContainer>
      <InviteIcon type="functional" title={t('global-invite')} titleId={uniqueId('invite-icon-')} />
    </InviteContainer>
  );
};
