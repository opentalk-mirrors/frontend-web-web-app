// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Divider, Menu, Stack, Typography, styled, useMediaQuery, useTheme, Button } from '@mui/material';
import { BackendModules } from '@opentalk/rest-api-rtk-query';
import { MouseEvent, useState, JSX } from 'react';
import { useTranslation } from 'react-i18next';

import {
  CameraOnIcon,
  FullscreenViewIcon,
  GridViewIcon,
  MeetingNotesIcon,
  ModeratorIcon,
  SpeakerViewIcon,
  TimerIcon,
  WhiteboardIcon,
} from '../../../assets/icons';
import { IconButton } from '../../../commonComponents';
import LayoutOptions from '../../../enums/LayoutOptions';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { CinemaViewSortOrder } from '../../../store/slices/common';
import { selectIsModuleEnabled } from '../../../store/slices/configSlice';
import {
  fullscreenActions,
  selectFullscreenActive,
  selectFullscreenSupported,
} from '../../../store/slices/fullscreen/slice';
import {
  selectCinemaLayout,
  selectCinemaViewOrder,
  selectIsCurrentMeetingNotesHighlighted,
  updatedCinemaLayout,
  updatedCinemaViewSortOrder,
} from '../../../store/slices/uiSlice';
import { selectIsWhiteboardAvailable } from '../../../store/slices/whiteboardSlice';
import LayoutSelectionMenuItem from '../../SelectParticipants/fragments/LayoutSelectionMenuItem';
import { Indicator } from './Indicator';

const ViewPopperContainer = styled(Stack)(({ theme }) => ({
  position: 'relative',
  background: theme.palette.background.customPaper.primary,
  color: theme.palette.background.customPaper.contrastText,
  borderRadius: '0.25rem',
  justifyContent: 'center',
  alignItems: 'center',
  '& .MuiPopover-paper': { marginTop: '0.3rem' },
  '& .MuiIconButton-root .MuiSvgIcon-root': {
    [theme.breakpoints.down('md')]: { fontSize: theme.typography.pxToRem(20) },
  },
}));

const ButtonIndicator = styled(Indicator)({ position: 'absolute', top: '0.1rem', right: '0.1rem' });

const getLayoutIcon = (layout: LayoutOptions): JSX.Element | null => {
  switch (layout) {
    case LayoutOptions.Grid:
      return <GridViewIcon />;
    case LayoutOptions.MeetingNotes:
      return <MeetingNotesIcon />;
    case LayoutOptions.Speaker:
      return <SpeakerViewIcon />;
    case LayoutOptions.Whiteboard:
      return <WhiteboardIcon />;
    default:
      return null;
  }
};

const LayoutSelection = () => {
  const dispatch = useAppDispatch();
  const selectedLayout = useAppSelector(selectCinemaLayout);
  const selectedGridViewOrder = useAppSelector(selectCinemaViewOrder);
  const { t } = useTranslation();
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const isViewPopoverOpen = Boolean(anchorElement);
  const closeViewPopover = () => setAnchorElement(null);
  const openViewPopover = ({ currentTarget }: MouseEvent<HTMLElement>) => {
    setAnchorElement(currentTarget);
  };
  const isWhiteboardAvailable = useAppSelector(selectIsWhiteboardAvailable);
  const isMeetingNotesFeatureAvailable = useAppSelector(selectIsModuleEnabled(BackendModules.MeetingNotes));
  const isCurrentMeetingNotesHighlighted = useAppSelector(selectIsCurrentMeetingNotesHighlighted);
  const isFullscreenSupported = useAppSelector(selectFullscreenSupported);
  const isFullscreenActive = useAppSelector(selectFullscreenActive);

  /**
   * Placeholder condition for all features that has to show indicator.
   */
  const showButtonIndicator = isCurrentMeetingNotesHighlighted;

  const openFullscreenView = () => {
    closeViewPopover();
    dispatch(fullscreenActions.request());
  };

  const handleSelectedView = (layout: LayoutOptions, order: CinemaViewSortOrder = CinemaViewSortOrder.FirstJoined) => {
    closeViewPopover();
    dispatch(updatedCinemaLayout({ layout, cacheLastLayout: true }));
    dispatch(updatedCinemaViewSortOrder(order));
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const viewIcon = getLayoutIcon(selectedLayout);

  const isWhiteBoard = selectedLayout === LayoutOptions.Whiteboard;
  const isMeetingNotes = selectedLayout === LayoutOptions.MeetingNotes;

  return (
    <ViewPopperContainer>
      {!isMobile && isMeetingNotes && (
        <Button
          variant="text"
          color="inherit"
          aria-expanded={isViewPopoverOpen}
          aria-haspopup="true"
          aria-controls={isViewPopoverOpen ? 'view-popover-menu' : undefined}
          aria-label={t('conference-view-trigger-button')}
          onClick={() => handleSelectedView(LayoutOptions.Grid)}
        >
          {t('meeting-notes-hide')}
        </Button>
      )}
      {!isMobile && isWhiteBoard && (
        <Button
          variant="text"
          color="inherit"
          aria-expanded={isViewPopoverOpen}
          aria-haspopup="true"
          aria-controls={isViewPopoverOpen ? 'view-popover-menu' : undefined}
          aria-label={t('conference-view-trigger-button')}
          onClick={() => handleSelectedView(LayoutOptions.Grid)}
        >
          {t('whiteboard-hide')}
        </Button>
      )}
      {(isMobile || (!isMobile && !(isWhiteBoard || isMeetingNotes))) && (
        <IconButton
          aria-expanded={isViewPopoverOpen}
          aria-haspopup="true"
          aria-controls={isViewPopoverOpen ? 'view-popover-menu' : undefined}
          aria-label={t('conference-view-trigger-button')}
          onClick={openViewPopover}
        >
          {viewIcon}
          {showButtonIndicator && isMobile && <ButtonIndicator />}
        </IconButton>
      )}
      <Menu
        open={isViewPopoverOpen}
        anchorEl={anchorElement}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        onClose={closeViewPopover}
        id="view-popover-menu"
        slotProps={{
          list: {
            'aria-label': t('conference-view-trigger-button'),
          },
        }}
      >
        <LayoutSelectionMenuItem
          role="menuitemradio"
          showCheckIcon={selectedLayout === LayoutOptions.Grid}
          onClick={() => handleSelectedView(LayoutOptions.Grid)}
          icon={<GridViewIcon />}
          content={t('conference-view-grid')}
        />
        <LayoutSelectionMenuItem
          role="menuitemradio"
          showCheckIcon={selectedLayout === LayoutOptions.Speaker}
          onClick={() => handleSelectedView(LayoutOptions.Speaker)}
          icon={<SpeakerViewIcon />}
          content={t('conference-view-speaker')}
        />
        {isFullscreenSupported && (
          <LayoutSelectionMenuItem
            role="menuitemradio"
            showCheckIcon={isFullscreenActive}
            onClick={openFullscreenView}
            icon={<FullscreenViewIcon />}
            content={t('conference-view-fullscreen')}
          />
        )}
        {((isMobile && isMeetingNotesFeatureAvailable) || (!isMobile && isMeetingNotes)) && (
          <LayoutSelectionMenuItem
            onClick={() => handleSelectedView(LayoutOptions.MeetingNotes)}
            hasIndicator={isCurrentMeetingNotesHighlighted}
            role="menuitemradio"
            showCheckIcon={selectedLayout === LayoutOptions.MeetingNotes}
            icon={<MeetingNotesIcon />}
            content={t('moderationbar-button-meeting-notes-tooltip')}
          />
        )}
        {((isMobile && isWhiteboardAvailable) || (!isMobile && isWhiteBoard)) && (
          <LayoutSelectionMenuItem
            onClick={() => handleSelectedView(LayoutOptions.Whiteboard)}
            role="menuitemradio"
            showCheckIcon={selectedLayout === LayoutOptions.Whiteboard}
            icon={<WhiteboardIcon />}
            content={t('moderationbar-button-whiteboard-tooltip')}
          />
        )}
        <Divider component="li">
          <Typography variant="caption" component="span">
            {t('conference-view-sorting')}
          </Typography>
        </Divider>
        <LayoutSelectionMenuItem
          role="menuitemradio"
          onClick={() => handleSelectedView(selectedLayout, CinemaViewSortOrder.FirstJoined)}
          showCheckIcon={selectedGridViewOrder === CinemaViewSortOrder.FirstJoined}
          icon={<TimerIcon />}
          content={t('conference-view-grid-first-joined')}
        />
        <LayoutSelectionMenuItem
          role="menuitemradio"
          onClick={() => handleSelectedView(selectedLayout, CinemaViewSortOrder.VideoFirst)}
          showCheckIcon={selectedGridViewOrder === CinemaViewSortOrder.VideoFirst}
          icon={<CameraOnIcon />}
          content={t('conference-view-grid-camera-first')}
        />
        <LayoutSelectionMenuItem
          role="menuitemradio"
          onClick={() => handleSelectedView(selectedLayout, CinemaViewSortOrder.ModeratorsFirst)}
          showCheckIcon={selectedGridViewOrder === CinemaViewSortOrder.ModeratorsFirst}
          icon={<ModeratorIcon />}
          content={t('conference-view-grid-moderators-first')}
        />
      </Menu>
    </ViewPopperContainer>
  );
};

export default LayoutSelection;
