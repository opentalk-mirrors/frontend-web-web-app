// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, DialogTitle } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { CloseIcon } from '../../assets/icons';
import IconButton from '../IconButtons/IconButton';

export type CommonDialogHeaderProps = {
  closeMenu: () => void;
  titleKey: string;
};
const CommonDialogHeader = ({ closeMenu, titleKey }: CommonDialogHeaderProps) => {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingX: 3,
        paddingTop: 1,
        gap: 2,
      }}
    >
      <DialogTitle sx={{ padding: 0, flexGrow: 1 }}>{t(titleKey)}</DialogTitle>
      <IconButton size="small" onClick={closeMenu} aria-label={t('global-close-dialog')} sx={{ marginRight: -1 }}>
        <CloseIcon />
      </IconButton>
    </Box>
  );
};

export default CommonDialogHeader;
