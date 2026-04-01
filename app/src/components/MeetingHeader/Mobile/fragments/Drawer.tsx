// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Drawer as MuiDrawer, Stack, styled } from '@mui/material';
import { BackendModules } from '@opentalk/rest-api-rtk-query';
import { useTranslation } from 'react-i18next';

import { ModerationTabKey } from '../../../../config/constants';
import {
  PollsAndVotesMobileTab,
  SupportMenuMobileTab,
  Tab,
  WaitingRoomMobileTab,
} from '../../../../config/moderationTabs';
import { useAppDispatch, useAppSelector } from '../../../../hooks';
import useTabs from '../../../../hooks/useTabs';
import { selectActivePollsAndVotingCount, selectPollsAndVotingCount } from '../../../../store/selectors';
import {
  selectHasAnyUnreadPrivateChatMessage,
  selectUnreadGlobalMessageCount,
} from '../../../../store/slices/chatSlice';
import { selectParticipantsWaitingCount } from '../../../../store/slices/participantsSlice';
import { selectWaitingRoomState } from '../../../../store/slices/roomSlice';
import {
  selectActiveTab,
  selectHaveSeenMobilePollsAndVotes,
  selectIsDrawerOpen,
  setActiveTab,
  setIsDrawerOpen,
} from '../../../../store/slices/uiSlice';
import { selectIsModerator } from '../../../../store/slices/userSlice';
import { generateUniqueId } from '../../../../utils/stringUtils';
import { DrawerButton } from './DrawerButton';
import DrawerTab from './DrawerTab';

const DrawerContentContainer = styled(Stack)<{ component?: string }>(({ theme }) => ({
  height: '100%',
  width: '100%',
  background: theme.palette.background.customPaper.primary,
  padding: theme.spacing(1, 1),
  overflow: 'auto',
  marginTop: 'auto',
  marginBottom: 'auto',
}));

const StyledDrawer = styled(MuiDrawer)(({ theme }) => ({
  '& .MuiPaper-root.MuiDrawer-paper': {
    width: '80%',
    background: theme.palette.background.customPaper.primary,
  },
}));

const Drawer = () => {
  const isDrawerOpen = useAppSelector(selectIsDrawerOpen);
  const activeTab = useAppSelector(selectActiveTab);
  const dispatch = useAppDispatch();
  const tabs = useTabs();
  const unreadGlobalMessageCount = useAppSelector(selectUnreadGlobalMessageCount);
  const hasAnyUnreadPrivateChatMessage = useAppSelector(selectHasAnyUnreadPrivateChatMessage);
  const isModerator = useAppSelector(selectIsModerator);
  const participantsWaitingCount = useAppSelector(selectParticipantsWaitingCount);
  const isWaitingRoomEnabled = useAppSelector(selectWaitingRoomState);
  const hasUnreadMessages = unreadGlobalMessageCount > 0 || hasAnyUnreadPrivateChatMessage;
  const voteAndPollCount = useAppSelector(selectPollsAndVotingCount);
  const activeVoteAndPollCount = useAppSelector(selectActivePollsAndVotingCount);
  const haveSeenMobilePollsAndVotes = useAppSelector(selectHaveSeenMobilePollsAndVotes);

  const handleSetActiveTab = (tabKey: ModerationTabKey) => dispatch(setActiveTab(tabKey));

  const { t } = useTranslation();

  const drawerId = generateUniqueId();

  const getTabTitle = (tab: Tab) => {
    if (tab.titleKey) {
      return t(`${tab.titleKey}`);
    }
    if (tab.key === ModerationTabKey.Home) {
      return t(`${tab.tooltipTranslationKey}`);
    }

    return '';
  };

  const mobileParticipantTabs = tabs.filter((tab) => tab.key === ModerationTabKey.Home);
  if (!isModerator && voteAndPollCount > 0) {
    mobileParticipantTabs.unshift(PollsAndVotesMobileTab);
  }

  mobileParticipantTabs.push(SupportMenuMobileTab);

  const mobileModerationTabs = tabs.slice();
  if (isWaitingRoomEnabled && isModerator) {
    /**
     * This solution works for now as we want waiting room to be first tab
     * when it's available and is only conditionally visible tab outside of the
     * settings. This will be refactored in the future when we have more tabs.
     */
    mobileModerationTabs.unshift(WaitingRoomMobileTab);
  }

  mobileModerationTabs.push(SupportMenuMobileTab);

  const open = () => {
    if (activeVoteAndPollCount > 0 && !isModerator) {
      dispatch(setActiveTab(ModerationTabKey.PollsAndLegalVote));
    }
    if (participantsWaitingCount > 0 && isModerator) {
      // The click on the indicator "o" opens the waiting room overview
      dispatch(setActiveTab(ModerationTabKey.WaitingRoom));
    }
    dispatch(setIsDrawerOpen(true));
  };

  const close = () => {
    dispatch(setIsDrawerOpen(false));
    if (participantsWaitingCount === 0 && activeTab === ModerationTabKey.WaitingRoom && isModerator) {
      dispatch(setActiveTab(ModerationTabKey.Home));
    }
  };

  const toggle = () => {
    return isDrawerOpen ? close() : open();
  };

  const renderTabs = (tabs: Tab[]) => {
    return tabs.map((tab) => {
      const isOmittedTab =
        tab.divider || tab.moduleKey === BackendModules.LegalVote || tab.moduleKey === BackendModules.Polls;

      if (!isOmittedTab) {
        const showIndicatorOnWaitingRoomTab = ModerationTabKey.WaitingRoom === tab.key && participantsWaitingCount > 0;
        const showIndicatorOnHomeTab = ModerationTabKey.Home === tab.key && hasUnreadMessages;
        const showIndicatorOnPollsAndLegalVoteTab =
          ModerationTabKey.PollsAndLegalVote === tab.key && voteAndPollCount > 0 && !haveSeenMobilePollsAndVotes;

        // Placeholder condition to show indicator inside of the drawer accordion button.
        const showIndicator =
          showIndicatorOnWaitingRoomTab || showIndicatorOnHomeTab || showIndicatorOnPollsAndLegalVoteTab;

        return (
          <DrawerTab
            key={tab.key}
            tabTitle={getTabTitle(tab)}
            disabled={tab.disabled}
            active={activeTab === tab.key}
            handleClick={() => handleSetActiveTab(tab.key)}
            showIndicator={Boolean(showIndicator)}
          >
            {tab.component}
          </DrawerTab>
        );
      }

      return null;
    });
  };

  return (
    <>
      <DrawerButton onClick={toggle} expanded={isDrawerOpen} controls={drawerId} />
      <StyledDrawer open={isDrawerOpen} onClose={close} id={drawerId}>
        <DrawerContentContainer component="ul">
          {renderTabs(isModerator ? mobileModerationTabs : mobileParticipantTabs)}
        </DrawerContentContainer>
      </StyledDrawer>
    </>
  );
};

export default Drawer;
