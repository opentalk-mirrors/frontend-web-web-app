// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  ListItemIcon,
  MenuList,
  MenuItem as MuiMenuItem,
  Popover,
  Stack,
  Typography,
  styled,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { batch } from 'react-redux';

import { CheckIcon, FullscreenViewIcon, GridViewIcon, MeetingNotesIcon, SpeakerViewIcon } from '../../../assets/icons';
import { IconButton } from '../../../commonComponents';
import LayoutOptions from '../../../enums/LayoutOptions';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { useFullscreenContext } from '../../../hooks/useFullscreenContext';
import { selectIsMeetingNotesAvailable } from '../../../store/slices/meetingNotesSlice';
import {
  GridViewOrder,
  selectCinemaLayout,
  selectGridViewOrder,
  selectIsCurrentMeetingNotesHighlighted,
  toggledFullScreenMode,
  updatedCinemaLayout,
  updatedGridViewOrder,
} from '../../../store/slices/uiSlice';
import TextWithDivider from '../../TextWithDivider';
import { Indicator } from './Indicator';

const ViewPopperContainer = styled(Stack)(({ theme }) => ({
  position: 'relative',
  background: theme.palette.background.video,
  borderRadius: '0.25rem',
  justifyContent: 'center',
  alignItems: 'center',
  '& .MuiPopover-paper': {
    marginTop: '0.3rem',
    background: theme.palette.background.defaultGradient,
  },
  '& .MuiIconButton-root .MuiSvgIcon-root': {
    [theme.breakpoints.down('md')]: {
      fontSize: theme.typography.pxToRem(20),
    },
  },
}));

const PopoverContainer = styled(MenuList)(({ theme }) => ({
  background: theme.palette.background.video,
}));

const MenuItem = styled(MuiMenuItem, {
  shouldForwardProp: (prop) => prop !== 'hasIndicator',
})<{ hasIndicator?: boolean }>(({ theme, hasIndicator }) => ({
  padding: theme.spacing(1),
  '& .MuiListItemIcon-root .MuiSvgIcon-root': {
    position: 'relative',
    fontSize: theme.typography.pxToRem(16),
    [theme.breakpoints.down('md')]: {
      fontSize: theme.typography.pxToRem(20),
    },
  },
  '&:after': {
    content: '""',
    display: hasIndicator ? 'block' : 'none',
    width: '0.5rem',
    height: '0.5rem',
    background: theme.palette.primary.main,
    borderRadius: '50%',
    marginLeft: '0.5rem',
  },
}));

const ButtonIndicator = styled(Indicator)({
  position: 'absolute',
  top: '0.1rem',
  right: '0.1rem',
});

const LayoutSelection = () => {
  const dispatch = useAppDispatch();
  const fullscreenHandle = useFullscreenContext();
  const selectedLayout = useAppSelector(selectCinemaLayout);
  const selectedGridViewOrder = useAppSelector(selectGridViewOrder);
  const { t } = useTranslation();
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const isViewPopoverOpen = Boolean(anchorElement);
  const isMeetingNotesAvailable = useAppSelector(selectIsMeetingNotesAvailable);
  const isCurrentMeetingNotesHighlighted = useAppSelector(selectIsCurrentMeetingNotesHighlighted);

  /**
   * Placeholder condition for all features that has to show indicator.
   */
  const showButtonIndicator = isCurrentMeetingNotesHighlighted;

  const openFullscreenView = useCallback(() => {
    setAnchorElement(null);
    fullscreenHandle.enter();
    dispatch(toggledFullScreenMode());
  }, [fullscreenHandle, dispatch]);

  const handleSelectedView = (layout: LayoutOptions, order: GridViewOrder = GridViewOrder.FirstJoined) => {
    setAnchorElement(null);
    batch(() => {
      dispatch(updatedCinemaLayout(layout));
      dispatch(updatedGridViewOrder(order));
    });
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const ViewIcon = useMemo(() => {
    switch (selectedLayout) {
      case LayoutOptions.Grid:
        return <GridViewIcon />;
      case LayoutOptions.MeetingNotes:
        return isMobile ? <MeetingNotesIcon /> : <Typography noWrap>{t('meeting-notes-hide')}</Typography>;
      case LayoutOptions.Whiteboard:
        return <Typography noWrap>{t('whiteboard-hide')}</Typography>;
      case LayoutOptions.Speaker:
        return <SpeakerViewIcon />;
    }
  }, [selectedLayout, isMobile, t]);

  return (
    <ViewPopperContainer>
      <IconButton
        aria-expanded={isViewPopoverOpen ? 'true' : undefined}
        aria-haspopup="true"
        aria-controls={isViewPopoverOpen ? 'view-popover-menu' : undefined}
        aria-label={t('conference-view-trigger-button')}
        onClick={(event) =>
          [LayoutOptions.Whiteboard].includes(selectedLayout)
            ? handleSelectedView(LayoutOptions.Grid)
            : setAnchorElement(event.currentTarget)
        }
      >
        {ViewIcon}
        {showButtonIndicator && isMobile && <ButtonIndicator />}
      </IconButton>
      <Popover
        open={isViewPopoverOpen}
        anchorEl={anchorElement}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        onClose={() => setAnchorElement(null)}
        disablePortal
      >
        <PopoverContainer id="view-popover-menu" autoFocusItem={isViewPopoverOpen}>
          <MenuItem role="menuitemradio" onClick={() => handleSelectedView(LayoutOptions.Grid)}>
            <ListItemIcon>
              {selectedLayout === LayoutOptions.Grid && selectedGridViewOrder === GridViewOrder.FirstJoined && (
                <CheckIcon />
              )}
            </ListItemIcon>
            <ListItemIcon aria-hidden={true}>
              <GridViewIcon />
            </ListItemIcon>
            {t('conference-view-grid')}
          </MenuItem>
          <MenuItem role="menuitemradio" onClick={() => handleSelectedView(LayoutOptions.Speaker)}>
            <ListItemIcon>{selectedLayout === LayoutOptions.Speaker && <CheckIcon />}</ListItemIcon>
            <ListItemIcon aria-hidden={true}>
              <SpeakerViewIcon />
            </ListItemIcon>
            {t('conference-view-speaker')}
          </MenuItem>
          <MenuItem role="menuitemradio" onClick={openFullscreenView}>
            <ListItemIcon>{fullscreenHandle.active && <CheckIcon />}</ListItemIcon>
            <ListItemIcon aria-hidden={true}>
              <FullscreenViewIcon />
            </ListItemIcon>
            {t('conference-view-fullscreen')}
          </MenuItem>
          {isMobile && isMeetingNotesAvailable && (
            <MenuItem
              onClick={() => handleSelectedView(LayoutOptions.MeetingNotes)}
              hasIndicator={isCurrentMeetingNotesHighlighted}
              role="menuitemradio"
            >
              <ListItemIcon>{selectedLayout === LayoutOptions.MeetingNotes && <CheckIcon />}</ListItemIcon>
              <ListItemIcon aria-hidden={true}>
                <MeetingNotesIcon />
              </ListItemIcon>
              {t('moderationbar-button-meeting-notes-tooltip')}
            </MenuItem>
          )}
          <TextWithDivider variant="caption">{t('conference-view-sorting')}</TextWithDivider>
          <MenuItem
            role="menuitemradio"
            onClick={() => handleSelectedView(LayoutOptions.Grid, GridViewOrder.VideoFirst)}
          >
            <ListItemIcon>
              {selectedLayout === LayoutOptions.Grid && selectedGridViewOrder === GridViewOrder.VideoFirst && (
                <CheckIcon />
              )}
            </ListItemIcon>
            <ListItemIcon aria-hidden={true}>
              <GridViewIcon />
            </ListItemIcon>
            {t('conference-view-grid-camera-first')}
          </MenuItem>
          <MenuItem
            role="menuitemradio"
            onClick={() => handleSelectedView(LayoutOptions.Grid, GridViewOrder.ModeratorsFirst)}
          >
            <ListItemIcon>
              {selectedLayout === LayoutOptions.Grid && selectedGridViewOrder === GridViewOrder.ModeratorsFirst && (
                <CheckIcon />
              )}
            </ListItemIcon>
            <ListItemIcon aria-hidden={true}>
              <GridViewIcon />
            </ListItemIcon>
            {t('conference-view-grid-moderators-first')}
          </MenuItem>
        </PopoverContainer>
      </Popover>
    </ViewPopperContainer>
  );
};

export default LayoutSelection;
