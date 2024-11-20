// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { MenuItem, Popover } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SharedFolderIcon } from '../../../assets/icons';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import {
  selectIsSharedFolderOpened,
  selectSharedFolderPassword,
  selectSharedFolderUrl,
  sharedFolderOpened,
} from '../../../store/slices/sharedFolderSlice';
import { MeetingHeaderButton } from './MeetingHeaderButton';

export const SharedFolderPopover = () => {
  const [anchorElement, setAnchorElement] = useState<null | HTMLElement>(null);
  const isSharedFolderOpened = useAppSelector(selectIsSharedFolderOpened);
  const sharedFolderUrl = useAppSelector(selectSharedFolderUrl);
  const sharedFolderPassword = useAppSelector(selectSharedFolderPassword);
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isExpanded = Boolean(anchorElement);

  return (
    <>
      <MeetingHeaderButton
        active={!isSharedFolderOpened}
        onClick={(event) => setAnchorElement(event.currentTarget)}
        aria-label={t('shared-folder-open-label')}
        aria-expanded={isExpanded}
      >
        <SharedFolderIcon />
      </MeetingHeaderButton>
      <Popover
        open={Boolean(anchorElement)}
        anchorEl={anchorElement}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        onClose={() => setAnchorElement(null)}
        disablePortal
      >
        {sharedFolderUrl && (
          <MenuItem
            onClick={() => {
              dispatch(sharedFolderOpened());
              window.open(sharedFolderUrl, 'sharedFolder');
              setAnchorElement(null);
            }}
          >
            {t('shared-folder-open-label')}
          </MenuItem>
        )}
        {sharedFolderPassword && (
          <MenuItem
            onClick={() => {
              navigator.clipboard.writeText(sharedFolderPassword);
              setAnchorElement(null);
            }}
          >
            {t('shared-folder-password-label')}
          </MenuItem>
        )}
      </Popover>
    </>
  );
};
