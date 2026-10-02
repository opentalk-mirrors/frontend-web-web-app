// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Stack, styled } from '@mui/material';
import { KeyboardEvent, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { ChatIcon, ModeratorIcon, MessagesIcon, SpeakerQueueIcon } from '../../assets/icons';
import { MODERATION_MENU_VIEW } from '../../config/constants';
import { SIDE_PANEL_ID, SIDE_PANEL_TITLE_ID, ToolbarButtonIds } from '../../constants';
import { useAppDispatch, useAppSelector } from '../../hooks';
import useConferenceUiVersion from '../../hooks/useConferenceUiVersion';
import useTabs from '../../hooks/useTabs';
import { closeSidePanel, openSidePanel, selectSidePanelView } from '../../store/slices/uiSlice';
import { selectIsModerator } from '../../store/slices/userSlice';
import { SidePanelView } from '../../types/sidepanel';
import Chat from '../Chat';
import ChatOverview from '../ChatOverview';
import { MenuTab } from '../MenuTabs/fragments/constants';
import ModerationMenu from '../ModerationMenu';
import Participants from '../Participants';
import MeetingSidebarLegacy from './MeetingSidebarLegacy';
import SidePanelHeader from './fragments/SidePanelHeader';

const SidebarContainer = styled('aside')(({ theme }) => ({
  gridArea: 'sidebar',
  display: 'flex',
  minHeight: 0,
  background: theme.palette.background.customPaper.primary,
  color: theme.palette.text.primary,
  borderRadius: theme.borderRadius.medium,
  boxShadow: '0 1.187rem 3.187rem 0 rgb(0 0 0 / 16%), 0 0.875rem 1.187rem 0 rgb(0 0 0 / 7%)',
  flex: 1,
  // Sharing the main grid area lets the panel overlay the video instead of shrinking it.
  [theme.breakpoints.down('lg')]: {
    gridArea: 'main',
    justifySelf: 'end',
    zIndex: 1,
  },
}));
const UserSidebarContainer = styled(Stack)({
  width: 332,
  minHeight: 0,
});

const PanelContent = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
  overflow: 'hidden',
  padding: theme.spacing(1, 3, 2.5),
  '& > .MuiStack-root': {
    padding: theme.spacing(0.5),
  },
}));

// Mirrors the ids assigned by SidePanelToolbar so focus can return to the invoking button.
const getToolbarButtonId = (view: SidePanelView) => {
  switch (view) {
    case MenuTab.Chat:
      return ToolbarButtonIds.Chat;
    case MenuTab.People:
      return ToolbarButtonIds.Participants;
    case MenuTab.Messages:
      return ToolbarButtonIds.Messages;
    default:
      return ToolbarButtonIds.Moderator;
  }
};

const MeetingSidebar = () => {
  const { t } = useTranslation();
  const { isV2 } = useConferenceUiVersion();
  const isModerator = useAppSelector(selectIsModerator);
  const sidePanelView = useAppSelector(selectSidePanelView);
  const dispatch = useAppDispatch();
  const tabs = useTabs();
  const panelRef = useRef<HTMLDivElement>(null);
  const isInitialView = useRef(true);

  useEffect(() => {
    // Focusing on mount would steal focus from the meeting whenever the panel starts open.
    if (isInitialView.current) {
      isInitialView.current = false;
      return;
    }
    panelRef.current?.focus();
  }, [sidePanelView]);

  // V2-CLEANUP: drop this guard and MeetingSidebarLegacy
  if (!isV2) {
    return <MeetingSidebarLegacy />;
  }

  const resolveView = (view: SidePanelView) => {
    switch (view) {
      case MenuTab.Chat:
        return { title: t('global-chat'), icon: <ChatIcon />, content: <Chat /> };
      case MenuTab.People:
        return {
          title: t('global-participants'),
          icon: <SpeakerQueueIcon />,
          content: <Participants />,
        };
      case MenuTab.Messages:
        return { title: t('global-messages'), icon: <MessagesIcon />, content: <ChatOverview /> };
      case MODERATION_MENU_VIEW:
        return isModerator
          ? {
              title: t('toolbar-button-moderation-tooltip-title'),
              icon: <ModeratorIcon />,
              content: <ModerationMenu />,
            }
          : undefined;
      default: {
        const tab = isModerator ? tabs.find(({ key }) => key === view) : undefined;
        return (
          tab && {
            title: tab.titleKey ? t(tab.titleKey) : '',
            icon: tab.icon,
            content: tab.component,
            showBack: true,
          }
        );
      }
    }
  };

  // Falls back to chat when the stored view is unavailable, e.g. after moderator rights change
  const displayedView = (sidePanelView && resolveView(sidePanelView)) || resolveView(MenuTab.Chat);

  const handleClose = () => {
    dispatch(closeSidePanel());
    if (sidePanelView) {
      document.getElementById(getToolbarButtonId(sidePanelView))?.focus();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      handleClose();
    }
  };

  return (
    <SidebarContainer aria-label={t('landmark-complementary-tools')}>
      <UserSidebarContainer
        ref={panelRef}
        id={SIDE_PANEL_ID}
        role="region"
        aria-labelledby={SIDE_PANEL_TITLE_ID}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        <SidePanelHeader
          title={displayedView?.title ?? ''}
          icon={displayedView?.icon}
          onClose={handleClose}
          onBack={displayedView?.showBack ? () => dispatch(openSidePanel(MODERATION_MENU_VIEW)) : undefined}
        />
        <PanelContent>{displayedView?.content}</PanelContent>
      </UserSidebarContainer>
    </SidebarContainer>
  );
};

export default MeetingSidebar;
