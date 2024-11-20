// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Grid, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { CopyTextField } from '../../../commonComponents';
import { FieldKeys } from './constants';

interface MeetingLinkFieldProps {
  fieldKey: FieldKeys;
  checked: boolean;
  value?: string | URL;
  setHighlightedField: (value: FieldKeys) => void;
  tooltip?: string;
  isLoading?: boolean;
}

const MeetingLinkField = ({
  fieldKey,
  checked,
  value,
  setHighlightedField,
  tooltip,
  isLoading,
}: MeetingLinkFieldProps) => {
  const { t } = useTranslation();

  return (
    <Grid item xs={12} sm={6}>
      <Tooltip title={tooltip ?? ''}>
        <CopyTextField
          label={t(`dashboard-invite-to-meeting-${fieldKey}-label`)}
          ariaLabel={t(`dashboard-invite-to-meeting-copy-${fieldKey}-aria-label`)}
          isLoading={isLoading}
          onClick={() => setHighlightedField(fieldKey)}
          notificationText={t(`dashboard-invite-to-meeting-copy-${fieldKey}-success`)}
          checked={checked}
          value={value}
        />
      </Tooltip>
    </Grid>
  );
};

export default MeetingLinkField;
