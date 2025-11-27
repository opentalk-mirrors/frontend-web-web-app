// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, ButtonProps } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const SaveButton = (props: ButtonProps) => {
  const { t } = useTranslation();

  return (
    <Button variant="contained" type="submit" color="secondary" {...props}>
      {t('dashboard-settings-profile-button-save')}
    </Button>
  );
};
