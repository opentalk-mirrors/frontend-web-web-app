// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled, useMediaQuery, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { ModerationTabKey } from '../../config/moderationTabs';
import { useAppDispatch, useAppSelector, useTabs as useSidebarTabs } from '../../hooks';
import { selectActiveTab, setActiveTab } from '../../store/slices/uiSlice';
import { selectIsModerator } from '../../store/slices/userSlice';
import LocalVideo from '../LocalVideo';
import MenuTabs from '../MenuTabs/MenuTabs';
import ModerationSideToolbar from '../ModerationSideToolbar';
import Toolbar from '../Toolbar';
import SideTabPanel from './fragments/SideTabPanel';

const SideBar = styled('aside')(({ theme }) => ({
  gridArea: 'sidebar',
  display: 'flex',
  background: theme.palette.background.paper,
  borderRadius: theme.borderRadius.medium,
  flex: 1,
}));

const ProfileWindow = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isModerator',
})<{ isModerator?: boolean }>(({ theme, isModerator }) => ({
  display: 'flex',
  flexDirection: isModerator ? 'column-reverse' : 'column',
  borderRadius: theme.borderRadius.medium,
  padding: theme.spacing(2),
  transform: 'translateZ(0)',
  boxShadow: '0 1.187rem 3.187rem 0 rgb(0 0 0 / 16%), 0 0.875rem 1.187rem 0 rgb(0 0 0 / 7%)',
  width: '21rem',
  overflow: 'hidden',
}));

const MeetingSidebar = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isSmartphone = useMediaQuery(theme.breakpoints.down('sm'));
  const isSmallDeviceInLandscape = useMediaQuery(`${theme.breakpoints.down('md')} and (orientation: landscape)`);
  const isModerator = useAppSelector(selectIsModerator);
  const CHAT_PANEL_VALUE = ModerationTabKey.Home;
  const activeTab = useAppSelector(selectActiveTab);
  const dispatch = useAppDispatch();
  const tabs = useSidebarTabs();

  const handleSetActiveTab = (tabKey: ModerationTabKey) => dispatch(setActiveTab(tabKey));

  if (isSmartphone || isSmallDeviceInLandscape) {
    return null;
  }

  const renderTabPanelContent = () => {
    return tabs.map((tab) => {
      if (!tab.divider) {
        return (
          <SideTabPanel
            key={tab.key}
            value={tab.key}
            hidden={activeTab !== tab.key}
            tabTitle={tab.titleKey ? t(tab.titleKey) : ''}
          >
            {tab.component}
          </SideTabPanel>
        );
      }
    });
  };

  return isModerator ? (
    <SideBar aria-label={t('landmark-complementary-tools')}>
      <ModerationSideToolbar displayedTabs={tabs} onSelect={handleSetActiveTab} activeTab={activeTab} />
      <ProfileWindow isModerator={isModerator}>
        {renderTabPanelContent()}
        <Toolbar />
        <LocalVideo />
      </ProfileWindow>
    </SideBar>
  ) : (
    <SideBar aria-label={t('landmark-complementary-tools')}>
      <ProfileWindow>
        <LocalVideo />
        <Toolbar />
        <SideTabPanel value={CHAT_PANEL_VALUE}>
          <MenuTabs />
        </SideTabPanel>
      </ProfileWindow>
    </SideBar>
  );
};

export default MeetingSidebar;
