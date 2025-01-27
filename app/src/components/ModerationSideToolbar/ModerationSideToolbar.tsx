// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Tab as MuiTab, Tabs as MuiTabs, styled, Tooltip, Divider, Button, Box } from '@mui/material';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { ModerationTabKey, Tab as TabProps } from '../../config/moderationTabs';

const INDICATOR_WIDTH_IN_PIXELS = 2;

const Tabs = styled(MuiTabs)(({ theme }) => ({
  //todo align a proper background color from theme (for now nothing fit)
  background: theme.palette.background.voteResult,
  padding: theme.spacing(4.5, 0),
  borderBottomLeftRadius: theme.borderRadius.medium,
  borderTopLeftRadius: theme.borderRadius.medium,
  height: '100%',
  '& .MuiTabs-flexContainer': {
    display: 'grid',
    gridColumns: '1fr',
    gridTemplateRows: '4fr repeat(11, 1fr)',
    alignItems: 'flex-start',
    rowGap: theme.spacing(0.5),
    height: '100%',
    '@media (max-height:800px)': {
      gridTemplateRows: '1fr repeat(11, 1fr)',
      rowGap: theme.spacing(0.25),
    },
  },
  '& .MuiTabs-indicator': {
    left: 0,
    width: `${INDICATOR_WIDTH_IN_PIXELS}px`,
    display: 'block',
    backgroundColor: theme.palette.primary.main,
    transition: 'none',
  },
  //Makes outline visible without changing overflow settings
  width: `calc(100% - ${theme.typography.pxToRem(2)} * 2)`,
  '& .MuiTabs-scroller': {
    padding: theme.typography.pxToRem(2),
  },
}));

const Tab = styled(MuiTab)<{ component?: React.ElementType }>(({ theme }) => ({
  color: theme.palette.secondary.light,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(1),
  borderRadius: 0,
  minWidth: '1rem',
  minHeight: '1rem',
  background: 'transparent',
  '& svg': {
    width: '1.25rem',
    fill: 'currentcolor',
  },
  '&.MuiButtonBase-root.Mui-disabled': {
    backgroundColor: 'transparent',
  },
  '&:hover:not(&.Mui-disabled)': {
    background: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
  },
  '&.Mui-selected': {
    //adjust for MuiTabs-indicator
    width: `calc(100% + ${INDICATOR_WIDTH_IN_PIXELS}px)`,
    background: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
  },
  '&.Mui-selected svg': {
    transform: `translate(-${INDICATOR_WIDTH_IN_PIXELS}px)`,
  },
  '&.Mui-selected .MuiTab-wrapper > svg': {
    fill: 'white',
  },
  '&.Mui-focusVisible': {
    outlineOffset: 0,
  },
}));

const ToolbarDivider = styled(Divider)(({ theme }) => ({
  padding: theme.spacing(1),
  margin: theme.spacing(0, 1),
  borderBottom: `3px solid ${theme.palette.secondary.lightest}`,
}));

export type ModerationSideToolbarProps = {
  onSelect: (tabKey: ModerationTabKey) => void;
  displayedTabs: TabProps[];
  activeTab: ModerationTabKey;
};

const ModerationSideToolbar = ({ onSelect, displayedTabs, activeTab }: ModerationSideToolbarProps) => {
  const { t } = useTranslation();

  const handleChange = useCallback(
    (_event: React.SyntheticEvent<Element, Event>, tabKey: ModerationTabKey) => {
      onSelect(tabKey);
    },
    [onSelect]
  );

  const renderTooltipTitle = (tab: TabProps) => {
    return t(tab.tooltipTranslationKey as string) || '';
  };

  const renderTabs = () =>
    displayedTabs.map((tab) =>
      tab.divider ? (
        <Tab key={tab.key} id={tab.key} value={tab.key} icon={<ToolbarDivider />} disabled aria-hidden />
      ) : (
        <Tab
          key={tab.key}
          icon={
            <Tooltip placement="right" title={renderTooltipTitle(tab)}>
              <Box component="span">{tab.icon}</Box>
            </Tooltip>
          }
          component={Button}
          id={tab.key}
          value={tab.key}
          disabled={tab.disabled}
          aria-controls={`tabpanel-${tab.key}`}
        />
      )
    );

  return (
    <aside aria-label={t('landmark-complementary-moderation-panel')}>
      <Tabs value={activeTab} onChange={handleChange} orientation="vertical">
        {renderTabs()}
      </Tabs>
    </aside>
  );
};

export default ModerationSideToolbar;
