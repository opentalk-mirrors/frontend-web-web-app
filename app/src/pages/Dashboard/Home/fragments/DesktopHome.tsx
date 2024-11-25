// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Stack, styled, Typography } from '@mui/material';
import { useState } from 'react';

import { RectAddPlusIcon } from '../../../../assets/icons';
import { default as DefaultJoinMeetingDialog } from '../../../../components/JoinMeetingDialog';
import StartMeetingImage from '../../../../components/StartMeetingImage';
import AdhocMeetingButton from './AdhocMeetingButton';
import CurrentMeetings from './CurrentMeetings';
import FavoriteMeetings from './FavoriteMeetings';
import NewMeetingButton from './NewMeetingButton';

const DesktopHomeContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  rowGap: theme.spacing(3),
  overflow: 'auto',
  columnGap: theme.spacing(5),
  gridTemplateColumns: '256px 1fr',
}));

const HeaderContainer = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(2),
  flexDirection: 'row',
  gridColumnStart: 2,
  justifyContent: 'space-between',
  alignItems: 'flex-end',
}));

interface DesktopHomeProps {
  pageHeading: string;
}

const DesktopHome = (props: DesktopHomeProps) => {
  const { pageHeading } = props;
  const [animation, setAnimation] = useState<boolean>(false);

  const DesktopJoinMeetingDialog = () => (
    <DefaultJoinMeetingDialog
      openButtonProps={{
        size: 'large',
        startIcon: <RectAddPlusIcon />,
        fullWidth: true,
      }}
    />
  );

  return (
    <DesktopHomeContainer>
      <HeaderContainer>
        <Typography component="h1" variant="body1">
          {pageHeading}
        </Typography>
        <NewMeetingButton />
      </HeaderContainer>
      <Stack flexDirection="column" flex={1} spacing={12.5} justifyContent="space-between">
        <Stack justifyContent="center" alignItems="center" spacing={1} paddingLeft={1}>
          <StartMeetingImage animated={animation} width={146} height={140} />
          <AdhocMeetingButton onHover={setAnimation} />
          <DesktopJoinMeetingDialog />
        </Stack>
        <FavoriteMeetings />
      </Stack>
      <CurrentMeetings />
    </DesktopHomeContainer>
  );
};

export default DesktopHome;
