// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Stack, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { ModerationTabKey } from '../../config/constants';
import { useAppDispatch, useAppSelector } from '../../hooks';
import useTabs from '../../hooks/useTabs';
import { selectActiveTab, setActiveTab } from '../../store/slices/uiSlice';
import { selectIsModerator } from '../../store/slices/userSlice';
import LocalVideo from '../LocalVideo';
import ModerationSideToolbar from '../ModerationSideToolbar';
import Toolbar from '../Toolbar';
import SideTabPanel from './fragments/SideTabPanel';

const SidebarContainer = styled('aside')(({ theme }) => ({
  gridArea: 'sidebar',
  display: 'flex',
  background: theme.palette.background.customPaper.primary,
  color: theme.palette.text.primary,
  borderRadius: theme.borderRadius.medium,
  boxShadow: '0 1.187rem 3.187rem 0 rgb(0 0 0 / 16%), 0 0.875rem 1.187rem 0 rgb(0 0 0 / 7%)',
  flex: 1,
}));
const UserSidebarContainer = styled(Stack)(({ theme }) => ({
  width: '21rem',
  padding: theme.spacing(2),
  flexDirection: 'column-reverse', // this is only needed to restore previous tab order (toolbar last)
}));

const MeetingSidebar = () => {
  const { t } = useTranslation();
  const isModerator = useAppSelector(selectIsModerator);
  const CHAT_PANEL_VALUE = ModerationTabKey.Home;
  const activeTab = useAppSelector(selectActiveTab);
  const dispatch = useAppDispatch();
  const tabs = useTabs();
  const selectedTab = isModerator ? activeTab : CHAT_PANEL_VALUE;
  const displayedTab = tabs.find((tab) => tab.key === selectedTab);

  const handleSetActiveTab = (tabKey: ModerationTabKey) => dispatch(setActiveTab(tabKey));

  return (
    <SidebarContainer aria-label={t('landmark-complementary-tools')}>
      {isModerator && (
        <ModerationSideToolbar displayedTabs={tabs} onSelect={handleSetActiveTab} activeTab={activeTab} />
      )}
      <UserSidebarContainer>
        {displayedTab && (
          <SideTabPanel
            key={displayedTab.key}
            value={displayedTab.key}
            tabTitle={displayedTab.titleKey ? t(displayedTab.titleKey) : ''}
          >
            {displayedTab.component}
          </SideTabPanel>
        )}
        <Toolbar />
        <LocalVideo />
      </UserSidebarContainer>
    </SidebarContainer>
  );
};

export default MeetingSidebar;
