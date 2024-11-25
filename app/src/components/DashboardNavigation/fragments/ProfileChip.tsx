// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Collapse, Typography, Button, styled } from '@mui/material';
import { Link } from 'react-router-dom';

import { useGetMeQuery } from '../../../api/rest';
import ProfilePicture from '../../ProfilePicture/ProfilePicture';

interface ChipProps {
  collapsed: boolean;
  withLabel?: boolean;
}

const ProfileButton = styled(Button)(({ theme }) => ({
  padding: 0,
  margin: theme.spacing(0.5, 0),
  border: 'none',
  '&.MuiButton-root': {
    justifyContent: 'flex-start',
  },
  ':hover': {
    border: 'none',
  },
})) as typeof Button;

const ProfileChip = ({ collapsed, withLabel }: ChipProps) => {
  const { data } = useGetMeQuery();
  const displayName = data?.displayName;

  return (
    <ProfileButton component={Link} to="settings/profile" variant="outlined" color="secondary" fullWidth>
      <ProfilePicture />
      {withLabel && (
        <Collapse orientation="horizontal" in={!collapsed}>
          <Typography noWrap translate="no">
            {displayName}
          </Typography>
        </Collapse>
      )}
    </ProfileButton>
  );
};

export default ProfileChip;
