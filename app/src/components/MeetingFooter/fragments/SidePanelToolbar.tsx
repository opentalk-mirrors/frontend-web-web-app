// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Badge, Box, styled } from '@mui/material';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { ChatIcon, ModeratorIcon, MessagesIcon, SpeakerQueueIcon } from '../../../assets/icons';
import { MODERATION_MENU_VIEW } from '../../../config/constants';
import { SIDE_PANEL_ID, ToolbarButtonIds } from '../../../constants';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import {
  selectHasAnyUnreadPrivateChatMessage,
  selectHasUnreadGlobalChatMessages,
} from '../../../store/slices/chatSlice';
import { selectSidePanelView, toggleModerationPanel, toggleSidePanel } from '../../../store/slices/uiSlice';
import { selectIsModerator } from '../../../store/slices/userSlice';
import { SidePanelView } from '../../../types/sidepanel';
import { isModerationView } from '../../../utils/isModerationView';
import { MenuTab } from '../../MenuTabs/fragments/constants';
import ToolbarButton from '../../Toolbar/fragments/ToolbarButton';

type SidePanelButton = {
  id: ToolbarButtonIds;
  view: SidePanelView;
  icon: ReactNode;
  tooltipKey: string;
  badgeContent?: number;
  showBadge?: boolean;
  moderatorOnly?: boolean;
};

const SidePanelToolbarContainer = styled(Box)(({ theme }) => ({
  gridColumn: 3,
  justifySelf: 'end',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const ButtonBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    background: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
  },
}));

const SidePanelToolbar = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const isModerator = useAppSelector(selectIsModerator);
  const hasUnreadGlobalChatMessages = useAppSelector(selectHasUnreadGlobalChatMessages);
  const hasUnreadPrivateChatMessages = useAppSelector(selectHasAnyUnreadPrivateChatMessage);
  const sidePanelView = useAppSelector(selectSidePanelView);

  const buttons: Array<SidePanelButton> = [
    {
      id: ToolbarButtonIds.Participants,
      view: MenuTab.People,
      icon: <SpeakerQueueIcon />,
      tooltipKey: 'global-participants',
    },
    {
      id: ToolbarButtonIds.Chat,
      view: MenuTab.Chat,
      icon: <ChatIcon />,
      tooltipKey: 'global-chat',
      showBadge: hasUnreadGlobalChatMessages,
    },
    {
      id: ToolbarButtonIds.Messages,
      view: MenuTab.Messages,
      icon: <MessagesIcon />,
      tooltipKey: 'global-messages',
      showBadge: hasUnreadPrivateChatMessages,
    },
    {
      id: ToolbarButtonIds.Moderator,
      view: MODERATION_MENU_VIEW,
      icon: <ModeratorIcon />,
      tooltipKey: 'toolbar-button-moderation-tooltip-title',
      moderatorOnly: true,
    },
  ];

  return (
    <SidePanelToolbarContainer role="group" aria-label={t('side-panel-toolbar-group-label')}>
      {buttons
        .filter(({ moderatorOnly }) => !moderatorOnly || isModerator)
        .map(({ id, view, icon, tooltipKey, badgeContent, showBadge }) => {
          const isModerationButton = view === MODERATION_MENU_VIEW;
          const isActive = isModerationButton ? isModerationView(sidePanelView) : sidePanelView === view;
          const isCountBadge = badgeContent !== undefined;

          return (
            <ToolbarButton
              key={id}
              id={id}
              tooltipTitle={t(tooltipKey)}
              active={isActive}
              onClick={() => dispatch(isModerationButton ? toggleModerationPanel() : toggleSidePanel(view))}
              aria-expanded={isActive}
              aria-controls={SIDE_PANEL_ID}
            >
              <ButtonBadge
                variant={isCountBadge ? 'standard' : 'dot'}
                badgeContent={badgeContent}
                invisible={!isCountBadge && !showBadge}
                role="presentation"
              >
                {icon}
              </ButtonBadge>
            </ToolbarButton>
          );
        })}
    </SidePanelToolbarContainer>
  );
};

export default SidePanelToolbar;
