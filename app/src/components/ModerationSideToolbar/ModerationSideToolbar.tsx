// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Divider, Tab as MuiTab, Tabs as MuiTabs, Tooltip, styled } from '@mui/material';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { ModerationTabKey } from '../../config/constants';
import { Tab as TabProps } from '../../config/moderationTabs';
import { useAppSelector } from '../../hooks';
import { selectIsRoomDeleted } from '../../store/slices/roomSlice';

const INDICATOR_WIDTH_IN_PIXELS = 2;

const Tabs = styled(MuiTabs)(({ theme }) => ({
  background: theme.palette.background.highlight.primary,
  padding: theme.spacing(4.5, 0),
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
    backgroundColor: theme.palette.secondary.main,
    transition: 'none',
  },
  '& .MuiTabs-scroller': {
    background: theme.palette.background.highlight.primary,
  },
}));

const Tab = styled(MuiTab)<{ component?: React.ElementType }>(({ theme }) => ({
  color: theme.palette.background.highlight.contrastText,
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
  '& .off-line': {
    fill: theme.palette.danger.light,
  },
  '&.MuiButtonBase-root.Mui-disabled': {
    opacity: 0.5,
  },
  '&:hover:not(&.Mui-disabled)': {
    background: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  '&.Mui-selected': {
    //adjust for MuiTabs-indicator
    width: `calc(100% + ${INDICATOR_WIDTH_IN_PIXELS}px)`,
    background: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
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

const ToolbarDivider = styled(Divider, {
  shouldForwardProp: (prop) => prop === 'key' || prop === 'role',
})(({ theme }) => ({
  padding: theme.spacing(0),
  margin: theme.spacing(0, 1),
  borderBottom: `3px solid ${theme.palette.background.customPaper.primary}`,
  alignSelf: 'center',
}));

const Aside = styled('aside')(({ theme }) => ({
  background: theme.palette.background.customPaper.primary,
  borderBottomLeftRadius: theme.borderRadius.medium,
  borderTopLeftRadius: theme.borderRadius.medium,
  overflow: 'hidden',
}));

export type ModerationSideToolbarProps = {
  onSelect: (tabKey: ModerationTabKey) => void;
  displayedTabs: TabProps[];
  activeTab: ModerationTabKey;
};

const ModerationSideToolbar = ({ onSelect, displayedTabs, activeTab }: ModerationSideToolbarProps) => {
  const { t } = useTranslation();
  const isRoomDeleted = useAppSelector(selectIsRoomDeleted);

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
        <ToolbarDivider key={tab.key} role="presentation" />
      ) : (
        <Tab
          key={tab.key}
          icon={
            <Tooltip placement="right" title={renderTooltipTitle(tab)}>
              <Box component="span" sx={{ p: 1 }}>
                {tab.icon}
              </Box>
            </Tooltip>
          }
          id={tab.key}
          value={tab.key}
          disabled={tab.disabled || isRoomDeleted}
          aria-controls={`tabpanel-${tab.key}`}
          sx={{ padding: 0 }}
        />
      )
    );

  return (
    <Aside aria-label={t('landmark-complementary-moderation-panel')}>
      <Tabs value={activeTab} onChange={handleChange} orientation="vertical">
        {renderTabs()}
      </Tabs>
    </Aside>
  );
};

export default ModerationSideToolbar;
