// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const RequiredFieldsInfo = () => {
  const { t } = useTranslation();

  return (
    <Typography>
      <span aria-hidden="true">*</span>
      {t('global-required-fields-info')}
    </Typography>
  );
};

export default RequiredFieldsInfo;
