// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, MenuItem, Stack, styled, Grid, SelectChangeEvent, Typography } from '@mui/material';
import { useState, ChangeEventHandler } from 'react';
import { useTranslation } from 'react-i18next';

import { RectAddPlusIcon } from '../../../../assets/icons';
import { CommonTextField } from '../../../../commonComponents';
import { default as DefaultJoinMeetingDialog } from '../../../../components/JoinMeetingDialog';
import AdhocMeetingButton from './AdhocMeetingButton';
import CurrentMeetings from './CurrentMeetings';
import FavoriteMeetings from './FavoriteMeetings';
import NewMeetingButton from './NewMeetingButton';

const MobileHomeContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  rowGap: theme.spacing(3),
}));

const HeaderContainer = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(2),
  flexDirection: 'column-reverse',
}));

const HeaderButtonsContainer = styled(Grid)(({ theme }) => ({
  rowGap: theme.spacing(2),
  justifyContent: 'space-between',
}));

const CurrentMeetingsContainer = styled(Box)(() => ({
  overflowY: 'auto',
  maxHeight: '62vh',
}));

const MobileJoinMeetingDialog = () => (
  <DefaultJoinMeetingDialog
    openButtonProps={{
      size: 'large',
      startIcon: <RectAddPlusIcon />,
      fullWidth: false,
    }}
  />
);

enum ViewOption {
  Current = 'current',
  Favorite = 'favorite',
}

const DEFAULT_VIEW: ViewOption = ViewOption.Current;

const MEETINGS_CONATINER_ID = 'meetings-container';
const VIEW_SELECT_ID = 'view-select';

export const MobileHome = () => {
  const { t } = useTranslation();
  const [selectedView, setSelectedView] = useState<ViewOption>(DEFAULT_VIEW);

  const MobileCurrentMeetings = () => (
    <>
      <Typography
        variant="body1"
        component="h2"
        sx={{
          pb: '0.75rem',
        }}
      >
        {t('dashboard-current-meetings')}
      </Typography>
      <CurrentMeetingsContainer>
        <CurrentMeetings />
      </CurrentMeetingsContainer>
    </>
  );

  const getSelectedView = () => {
    switch (selectedView) {
      case ViewOption.Current:
        return <MobileCurrentMeetings />;
      case ViewOption.Favorite:
        return <FavoriteMeetings />;
      default:
        return <MobileCurrentMeetings />;
    }
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event: SelectChangeEvent) => {
    if (event.target.value) {
      setSelectedView(event.target.value as ViewOption);
    }
  };

  return (
    <MobileHomeContainer>
      <HeaderContainer>
        <HeaderButtonsContainer container>
          <AdhocMeetingButton />
          <MobileJoinMeetingDialog />
          <NewMeetingButton />
        </HeaderButtonsContainer>
      </HeaderContainer>
      <CommonTextField
        select
        slotProps={{
          select: {
            id: VIEW_SELECT_ID,
            SelectDisplayProps: {
              'aria-label': t('dashboard-meeting-mobile-view-select'),
            },
            MenuProps: {
              MenuListProps: { 'aria-controls': MEETINGS_CONATINER_ID },
            },
          },
          input: {
            'aria-labelledby': VIEW_SELECT_ID,
          },
        }}
        defaultValue={DEFAULT_VIEW}
        onChange={handleChange}
      >
        {Object.values(ViewOption).map((value) => (
          <MenuItem key={value} value={value}>
            {t(`dashboard-${value}-meetings`)}
          </MenuItem>
        ))}
      </CommonTextField>
      <Box id={MEETINGS_CONATINER_ID} aria-label="Hi">
        {getSelectedView()}
      </Box>
    </MobileHomeContainer>
  );
};

export default MobileHome;
