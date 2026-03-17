// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Badge, Tab as MuiTab, Tabs as MuiTabs, Typography, styled } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { getContrastText } from '../../assets/themes/opentalk/colorUtils';
import { VisuallyHiddenTitle } from '../../commonComponents';
import { useAppDispatch, useAppSelector } from '../../hooks';
import {
  selectHasAnyUnreadGroupChatMessage,
  selectHasAnyUnreadPrivateChatMessage,
  selectHasUnreadGlobalChatMessages,
} from '../../store/slices/chatSlice';
import { selectParticipantsTotal } from '../../store/slices/participantsSlice';
import { selectCurrentMenuTab, setCurrentMenuTab } from '../../store/slices/uiSlice';
import Chat from '../Chat';
import ChatOverview from '../ChatOverview';
import Participants from '../Participants';
import TabPanel from './fragments/TabPanel';
import { MenuTab } from './fragments/constants';

const MessagesBadge = styled(Badge)(({ theme }) => ({
  right: -4,
  top: -3,
  '& .MuiBadge-badge': {
    background: theme.palette.secondary.main,
  },
}));

const ChatBadge = styled(Badge)(({ theme }) => ({
  right: -4,
  top: -3,
  '& .MuiBadge-badge': {
    background: theme.palette.secondary.main,
  },
}));

const Tabs = styled(MuiTabs)(({ theme }) => ({
  minHeight: 0,
  borderRadius: theme.borderRadius.large,
  backgroundColor: theme.palette.background.main.primary,
  color: theme.palette.background.main.contrastText,
  '& .MuiTabs-flexContainer': {
    alignItems: 'center',
    justifyContent: 'center',
  },
  '& .MuiTabs-indicator': {
    display: 'none',
  },
  '& .MuiTabs-scroller': {
    padding: theme.typography.pxToRem(2),
  },
}));

const Tab = styled(MuiTab)(({ theme }) => ({
  minWidth: '33%',
  minHeight: 0,
  fontSize: '0.75rem',
  borderRadius: theme.borderRadius.large,
  textTransform: 'initial',
  fontWeight: 400,
  padding: theme.spacing(1),
  whiteSpace: 'nowrap',
  color: 'currentColor',
  '&:hover, &.Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '.MuiBadge-badge': {
      background: getContrastText(theme.palette.secondary.main, theme.palette.primary.main),
    },
  },
  '&.Mui-selected:hover': {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  },
  '& .MuiTab-icon': {
    marginLeft: theme.spacing(0.2),
  },
}));

const MenuTabs = () => {
  const { t } = useTranslation();
  const hasUnreadGlobalChatMessages = useAppSelector(selectHasUnreadGlobalChatMessages);
  const hasUnreadGroupChatMessages = useAppSelector(selectHasAnyUnreadGroupChatMessage);
  const hasUnreadPrivateChatMessages = useAppSelector(selectHasAnyUnreadPrivateChatMessage);
  const totalParticipants = useAppSelector(selectParticipantsTotal);
  const currentMenuTab = useAppSelector(selectCurrentMenuTab);
  const dispatch = useAppDispatch();

  const handleChange = (_event: React.SyntheticEvent<Element, Event>, newValue: MenuTab) => {
    dispatch(setCurrentMenuTab(newValue));
  };

  return (
    <>
      <VisuallyHiddenTitle component="h2" label="menutabs-area-hidden-heading" />
      <Typography id="menutabs-people-complementary" component="span" sx={visuallyHidden}>
        {t('menutabs-people-complementary', { count: totalParticipants })}
      </Typography>
      <Tabs value={currentMenuTab} onChange={handleChange} variant="fullWidth">
        <Tab
          id={`tab-${MenuTab.Chat}`}
          label={t('menutabs-chat')}
          icon={hasUnreadGlobalChatMessages ? <ChatBadge variant="dot" role="presentation" /> : undefined}
          iconPosition="end"
          value={MenuTab.Chat}
          aria-controls={`tabpanel-${MenuTab.Chat}`}
        />
        <Tab
          id={`tab-${MenuTab.People}`}
          label={t('menutabs-people')}
          icon={
            <Typography variant="caption" aria-hidden="true" lineHeight={1}>
              ({totalParticipants})
            </Typography>
          }
          iconPosition="end"
          value={MenuTab.People}
          aria-controls={`tabpanel-${MenuTab.People}`}
          aria-describedby="menutabs-people-complementary"
        />
        <Tab
          id={`tab-${MenuTab.Messages}`}
          label={t('menutabs-messages')}
          icon={
            hasUnreadPrivateChatMessages || hasUnreadGroupChatMessages ? (
              <MessagesBadge variant="dot" role="presentation" />
            ) : undefined
          }
          iconPosition="end"
          value={MenuTab.Messages}
          aria-controls={`tabpanel-${MenuTab.Messages}`}
        />
      </Tabs>

      <TabPanel value={MenuTab.Chat} hidden={currentMenuTab !== MenuTab.Chat}>
        <VisuallyHiddenTitle component="h3" label="chatroom-hidden-heading" />
        <Chat />
      </TabPanel>
      <TabPanel value={MenuTab.People} hidden={currentMenuTab !== MenuTab.People}>
        <VisuallyHiddenTitle component="h3" label="participant-list-hidden-heading" />
        <Participants />
      </TabPanel>
      <TabPanel value={MenuTab.Messages} hidden={currentMenuTab !== MenuTab.Messages}>
        <ChatOverview />
      </TabPanel>
    </>
  );
};

export default MenuTabs;
