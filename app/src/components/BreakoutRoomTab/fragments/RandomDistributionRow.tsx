// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Switch } from '@mui/material';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { CommonFormItem } from '../../../commonComponents';

type RandomDistributionRowProps = {
  value: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function RandomDistributionRow(props: RandomDistributionRowProps) {
  const { t } = useTranslation();

  return (
    <CommonFormItem
      name="distribution"
      checked={props.value}
      onChange={props.onChange}
      control={<Switch color="primary" />}
      label={t('breakout-room-form-field-random-distribution')}
    />
  );
}
