// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { ForwardIcon } from '../../../assets/icons';

interface ActionButtonsProps {
  isExistingEvent: boolean;
  disableSaveButton: boolean;
  disableCancelButton?: boolean;
  onForwardButtonClick?: () => void;
}

const ActionButtons = ({
  isExistingEvent,
  disableSaveButton,
  disableCancelButton,
  onForwardButtonClick,
}: ActionButtonsProps) => {
  const { t } = useTranslation();
  return (
    <Grid
      container
      spacing={2}
      sx={{
        justifyContent: 'space-between',
        paddingBottom: 1,
        paddingRight: 1,
      }}
    >
      <Grid size={{ xs: 12, sm: 'auto' }}>
        {isExistingEvent && (
          <Button variant="text" color="secondary" endIcon={<ForwardIcon />} onClick={onForwardButtonClick}>
            {t('dashboard-meeting-to-step', { step: 2 })}
          </Button>
        )}
      </Grid>
      <Grid
        container
        size={{ xs: 12, sm: 'auto' }}
        spacing={3}
        sx={{
          flexDirection: { xs: 'column-reverse', sm: 'row' },
        }}
      >
        {!isExistingEvent && (
          <Grid>
            <Button
              component={Link}
              to="/dashboard/"
              variant="outlined"
              color="secondary"
              fullWidth
              disabled={disableCancelButton}
            >
              {t('dashboard-direct-meeting-button-cancel')}
            </Button>
          </Grid>
        )}
        <Grid>
          <Button fullWidth disabled={disableSaveButton} type="submit">
            {t(`global-save${isExistingEvent ? '-changes' : ''}`)}
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default ActionButtons;
