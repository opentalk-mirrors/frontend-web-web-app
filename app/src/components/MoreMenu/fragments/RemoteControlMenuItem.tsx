// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ListItemIcon, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import ShareScreenOnIcon from '../../../assets/icons/ShareScreenOnIcon';
import { useAppSelector } from '../../../hooks';
import { selectConfigFeatures } from '../../../store/slices/configSlice';
import MoreMenuItem from './MoreMenuItem';

const RemoteControlMenuItem = () => {
  const { t } = useTranslation();
  const configFeatures = useAppSelector(selectConfigFeatures);

  if (!configFeatures?.innovafoneAPI) {
    return null;
  }

  return (
    <MoreMenuItem onClick={() => window.open('com.innovaphone.myapps:remotecontrol', '_blank')}>
      <ListItemIcon>
        <ShareScreenOnIcon />
      </ListItemIcon>
      <Typography variant="inherit" noWrap>
        {t('more-menu-start-remote-control')}
      </Typography>
    </MoreMenuItem>
  );
};

export default RemoteControlMenuItem;
