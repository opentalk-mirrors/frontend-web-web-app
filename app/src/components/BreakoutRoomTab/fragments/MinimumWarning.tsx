// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';

type MinimumWarningProps = {
  labelKey: string;
  minimumNumberOfParticipants: number;
};

export function MinimumWarning(props: MinimumWarningProps) {
  const { t } = useTranslation();

  return (
    <Alert variant="outlined" severity="warning">
      {t(props.labelKey, {
        minimumNumberOfParticipants: props.minimumNumberOfParticipants,
      })}
    </Alert>
  );
}
