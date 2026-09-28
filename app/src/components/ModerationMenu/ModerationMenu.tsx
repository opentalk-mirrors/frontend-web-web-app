// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  ListItem,
  ListItemButton as MuiListItemButton,
  ListItemIcon as MuiListItemIcon,
  List as MuiList,
  ListItemText as MuiListItemText,
  ListSubheader,
  styled,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import { ModerationTabKey } from '../../config/constants';
import { useAppDispatch, useAppSelector } from '../../hooks';
import useTabs from '../../hooks/useTabs';
import { selectIsRoomDeleted } from '../../store/slices/roomSlice';
import { openSidePanel } from '../../store/slices/uiSlice';

const List = styled(MuiList)({
  width: '100%',
  padding: 0,
  overflow: 'auto',
});

const ListItemButton = styled(MuiListItemButton)(({ theme }) => ({
  gap: theme.spacing(1),
  borderRadius: theme.borderRadius.medium,
  '&:hover': {
    backgroundColor: theme.palette.background.highlight.primary,
  },
}));

const ListItemIcon = styled(MuiListItemIcon)({
  minWidth: 'auto',
  color: 'inherit',
});

const GroupLabel = styled(ListSubheader)(({ theme }) => ({
  padding: 0,
  background: 'transparent',
  color: theme.palette.grey[400],
  fontSize: theme.typography.pxToRem(12),
  fontWeight: 600,
  lineHeight: 1.25,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  margin: theme.spacing(2, 0, 0.5),
  '&:first-of-type': {
    marginTop: 0,
  },
}));

const ModerationMenu = () => {
  const tabs = useTabs();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isRoomDeleted = useAppSelector(selectIsRoomDeleted);

  return (
    <List>
      <GroupLabel>{t('moderation-menu-group-actions')}</GroupLabel>
      {tabs
        .filter(({ key }) => key !== ModerationTabKey.Home)
        .map(({ key, icon, divider, disabled, titleKey, tooltipTranslationKey }, index) =>
          divider ? (
            <GroupLabel key={`${key}-${index}`}>{t('moderation-menu-group-tools')}</GroupLabel>
          ) : (
            <ListItem key={key} disablePadding>
              <ListItemButton disabled={disabled || isRoomDeleted} onClick={() => dispatch(openSidePanel(key))}>
                <ListItemIcon>{icon}</ListItemIcon>
                <MuiListItemText primary={t(titleKey ?? tooltipTranslationKey ?? '')} />
              </ListItemButton>
            </ListItem>
          )
        )}
    </List>
  );
};

export default ModerationMenu;
