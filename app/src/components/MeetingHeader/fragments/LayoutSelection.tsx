// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  Divider,
  Stack,
  Typography,
  styled,
  useMediaQuery,
  useTheme,
  Button,
  Select,
  selectClasses,
  MenuItem,
  Box,
  FormControl,
  toggleButtonGroupClasses,
  ToggleButtonGroup,
  ToggleButton,
  toggleButtonClasses,
  Dialog,
  DialogTitle,
} from '@mui/material';
import { BackendModules } from '@opentalk/rest-api-rtk-query';
import { useState, JSX } from 'react';
import { useTranslation } from 'react-i18next';

import {
  FullscreenViewIcon,
  GridViewIcon,
  MeetingNotesIcon,
  SpeakerViewIcon,
  WhiteboardIcon,
  GridSize6Icon,
  GridSize9Icon,
  GridSize16Icon,
  GridSize24Icon,
  CloseIcon,
} from '../../../assets/icons';
import { IconButton } from '../../../commonComponents';
import { GRID_SIZES } from '../../../constants';
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
  selectCinemaGridSize,
  selectCinemaLayout,
  selectCinemaViewOrder,
  selectIsCurrentMeetingNotesHighlighted,
  selectLastCinemaLayout,
  updatedCinemaGridSize,
  updatedCinemaLayout,
  updatedCinemaViewSortOrder,
} from '../../../store/slices/uiSlice';
import { selectIsWhiteboardAvailable } from '../../../store/slices/whiteboardSlice';
import { Indicator } from './Indicator';

const CUSTOM_PADDING = 3;

const GRID_ICON_MAP: Record<number, JSX.Element> = {
  6: <GridSize6Icon />,
  9: <GridSize9Icon />,
  16: <GridSize16Icon />,
  24: <GridSize24Icon />,
};

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

const SpacedToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  paddingLeft: theme.spacing(CUSTOM_PADDING),
  paddingRight: theme.spacing(CUSTOM_PADDING),

  '& .MuiToggleButton-root': {
    flex: '1 1 auto',
    minWidth: 0,
  },
  [`& .${toggleButtonGroupClasses.firstButton}, & .${toggleButtonGroupClasses.middleButton}`]: {
    borderTopRightRadius: (theme.vars || theme).shape.borderRadius,
    borderBottomRightRadius: (theme.vars || theme).shape.borderRadius,
  },
  [`& .${toggleButtonGroupClasses.lastButton}, & .${toggleButtonGroupClasses.middleButton}`]: {
    borderTopLeftRadius: (theme.vars || theme).shape.borderRadius,
    borderBottomLeftRadius: (theme.vars || theme).shape.borderRadius,
    borderLeft: `1px solid ${theme.palette.divider}`,
  },
  [`& .${toggleButtonGroupClasses.lastButton}.${toggleButtonClasses.disabled}, & .${toggleButtonGroupClasses.middleButton}.${toggleButtonClasses.disabled}`]:
    {
      borderLeft: `1px solid ${theme.palette.divider}`,
    },
}));
const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  border: '1px solid',
  borderRadius: '0.25rem',
  borderColor: theme.palette.divider,
  textAlign: 'center',
  backgroundColor: theme.palette.background.main.primary,
  fontSize: '0.75rem',
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.focus.color}`,
  },
  '&.Mui-selected': {
    backgroundColor: theme.palette.background.highlight.primary,
    borderColor: theme.palette.secondary.main,
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  margin: theme.spacing(CUSTOM_PADDING),
  backgroundColor: theme.palette.background.main.primary,
  color: theme.palette.background.highlight.contrastText,
  [`& .${selectClasses.icon}`]: {
    fill: theme.palette.background.highlight.contrastText,
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: `${theme.palette.background.highlight.contrastText}`,
  },
}));

const ButtonIndicator = styled(Indicator)({ position: 'absolute', top: '0.1rem', right: '0.1rem' });

const SORT_OPTIONS: Array<{ value: CinemaViewSortOrder; labelKey: string; subtitleKey: string }> = [
  {
    value: CinemaViewSortOrder.ActivityFirst,
    labelKey: 'layout-selection-grid-activity-first',
    subtitleKey: 'layout-selection-grid-activity-first-subtitle',
  },
  {
    value: CinemaViewSortOrder.FirstJoined,
    labelKey: 'layout-selection-grid-first-joined',
    subtitleKey: 'layout-selection-grid-first-joined-subtitle',
  },
  {
    value: CinemaViewSortOrder.VideoFirst,
    labelKey: 'layout-selection-grid-camera-first',
    subtitleKey: 'layout-selection-grid-camera-first-subtitle',
  },
  {
    value: CinemaViewSortOrder.ModeratorsFirst,
    labelKey: 'layout-selection-grid-moderators-first',
    subtitleKey: 'layout-selection-grid-moderators-first-subtitle',
  },
];

const SORT_OPTION_LABEL_KEYS = SORT_OPTIONS.reduce<Record<CinemaViewSortOrder, string>>(
  (acc, { value, labelKey }) => {
    acc[value] = labelKey;
    return acc;
  },
  {} as Record<CinemaViewSortOrder, string>
);

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
const MenuHeader = ({ closeMenu }: { closeMenu: () => void }) => {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingX: CUSTOM_PADDING,
        paddingTop: 1,
        gap: 2,
      }}
    >
      <DialogTitle sx={{ padding: 0, flexGrow: 1 }}>{t('layout-selection-title')}</DialogTitle>
      <IconButton size="small" onClick={closeMenu} aria-label={t('global-close')} sx={{ marginRight: -1 }}>
        <CloseIcon />
      </IconButton>
    </Box>
  );
};

const LayoutSelection = () => {
  const dispatch = useAppDispatch();
  const selectedLayout = useAppSelector(selectCinemaLayout);
  const selectedGridViewOrder = useAppSelector(selectCinemaViewOrder);
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const closeViewPopover = () => setIsOpen(false);
  const openViewPopover = () => setIsOpen(true);

  const isWhiteboardAvailable = useAppSelector(selectIsWhiteboardAvailable);
  const isMeetingNotesFeatureAvailable = useAppSelector(selectIsModuleEnabled(BackendModules.MeetingNotes));
  const isCurrentMeetingNotesHighlighted = useAppSelector(selectIsCurrentMeetingNotesHighlighted);
  const isFullscreenSupported = useAppSelector(selectFullscreenSupported);
  const isFullscreenActive = useAppSelector(selectFullscreenActive);
  const selectedCinemaGridSize = useAppSelector(selectCinemaGridSize);
  const lastCinemaLayout = useAppSelector(selectLastCinemaLayout);
  /**
   * Placeholder condition for all features that has to show indicator.
   */
  const showButtonIndicator = isCurrentMeetingNotesHighlighted;

  const openFullscreenView = () => {
    closeViewPopover();
    dispatch(fullscreenActions.request());
  };

  const theme = useTheme();
  const isCompactLayout = useMediaQuery(theme.breakpoints.down('md'));

  const viewIcon = getLayoutIcon(selectedLayout);

  const isWhiteBoard = selectedLayout === LayoutOptions.Whiteboard;
  const isMeetingNotes = selectedLayout === LayoutOptions.MeetingNotes;

  return (
    <ViewPopperContainer>
      {!isCompactLayout && isMeetingNotes && (
        <Button
          variant="text"
          color="inherit"
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-controls={isOpen ? 'view-popover-menu' : undefined}
          aria-label={t('layout-selection-trigger-button')}
          onClick={() => dispatch(updatedCinemaLayout({ layout: lastCinemaLayout }))}
        >
          {t('meeting-notes-hide')}
        </Button>
      )}
      {!isCompactLayout && isWhiteBoard && (
        <Button
          variant="text"
          color="inherit"
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-controls={isOpen ? 'view-popover-menu' : undefined}
          aria-label={t('layout-selection-trigger-button')}
          onClick={() => dispatch(updatedCinemaLayout({ layout: lastCinemaLayout }))}
        >
          {t('whiteboard-hide')}
        </Button>
      )}
      {(isCompactLayout || (!isCompactLayout && !(isWhiteBoard || isMeetingNotes))) && (
        <IconButton
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-controls={isOpen ? 'view-popover-menu' : undefined}
          aria-label={t('layout-selection-trigger-button')}
          onClick={openViewPopover}
        >
          {viewIcon}
          {showButtonIndicator && isCompactLayout && <ButtonIndicator />}
        </IconButton>
      )}
      <Dialog open={isOpen} onClose={closeViewPopover} component="div" id="view-popover-menu">
        <MenuHeader closeMenu={closeViewPopover} />

        <Divider aria-hidden={true} />

        <Typography
          variant="caption"
          component="label"
          id="grid-view-group-label"
          sx={{ paddingLeft: CUSTOM_PADDING, marginBottom: 1 }}
        >
          {t('layout-selection-select-view')}
        </Typography>

        <SpacedToggleButtonGroup
          value={selectedLayout}
          exclusive
          onChange={(_, newLayout) => {
            if (newLayout !== null) {
              dispatch(updatedCinemaLayout({ layout: newLayout, cacheLastLayout: true }));
            }
          }}
          aria-labelledby="grid-view-group-label"
        >
          <StyledToggleButton value={LayoutOptions.Grid}>
            <GridViewIcon />
            {t('layout-selection-grid')}
          </StyledToggleButton>
          <StyledToggleButton value={LayoutOptions.Speaker}>
            <SpeakerViewIcon />
            {t('layout-selection-speaker')}
          </StyledToggleButton>
          {isFullscreenSupported && (
            <StyledToggleButton onClick={openFullscreenView} selected={isFullscreenActive} value={selectedLayout}>
              <FullscreenViewIcon />
              {t('layout-selection-fullscreen')}
            </StyledToggleButton>
          )}
          {((isCompactLayout && isMeetingNotesFeatureAvailable) || (!isCompactLayout && isMeetingNotes)) && (
            <StyledToggleButton
              onClick={() =>
                dispatch(updatedCinemaLayout({ layout: LayoutOptions.MeetingNotes, cacheLastLayout: true }))
              }
              selected={selectedLayout === LayoutOptions.MeetingNotes}
              value={LayoutOptions.MeetingNotes}
            >
              <MeetingNotesIcon />
              {t('moderationbar-button-meeting-notes-tooltip')}
            </StyledToggleButton>
          )}
          {((isCompactLayout && isWhiteboardAvailable) || (!isCompactLayout && isWhiteBoard)) && (
            <StyledToggleButton
              onClick={() => dispatch(updatedCinemaLayout({ layout: LayoutOptions.Whiteboard, cacheLastLayout: true }))}
              selected={selectedLayout === LayoutOptions.Whiteboard}
              value={LayoutOptions.Whiteboard}
            >
              <WhiteboardIcon />
              {t('moderationbar-button-whiteboard-tooltip')}
            </StyledToggleButton>
          )}
        </SpacedToggleButtonGroup>

        {selectedLayout === LayoutOptions.Grid && (
          <>
            <FormControl component="fieldset" variant="standard">
              <Typography
                variant="caption"
                component="label"
                id="grid-size-label"
                sx={{ paddingLeft: CUSTOM_PADDING, marginBottom: 1, marginTop: 2 }}
              >
                {t('layout-selection-grid-size')}
              </Typography>
              <SpacedToggleButtonGroup
                value={selectedCinemaGridSize}
                exclusive
                onChange={(_, newSize) => {
                  if (newSize !== null) {
                    dispatch(updatedCinemaGridSize(newSize));
                  }
                }}
                aria-labelledby="grid-size-label"
              >
                {GRID_SIZES.map((size) => {
                  const icon = GRID_ICON_MAP[size];
                  return (
                    <StyledToggleButton key={size} value={size}>
                      {icon}
                      {size}
                    </StyledToggleButton>
                  );
                })}
              </SpacedToggleButtonGroup>
            </FormControl>
          </>
        )}
        <Divider aria-hidden={true} />

        <Typography variant="caption" component="label" id="grid-sorting-label" sx={{ paddingLeft: CUSTOM_PADDING }}>
          {t('layout-selection-sorting')}
        </Typography>
        <StyledSelect
          value={selectedGridViewOrder}
          onChange={(e) => dispatch(updatedCinemaViewSortOrder(e.target.value as CinemaViewSortOrder))}
          labelId="grid-sorting-label"
          sx={{ marginTop: 1 }}
          renderValue={(value) => t(SORT_OPTION_LABEL_KEYS[value as CinemaViewSortOrder])}
        >
          {SORT_OPTIONS.map(({ value, labelKey, subtitleKey }) => (
            <MenuItem key={value} value={value} sx={{ alignItems: 'flex-start', whiteSpace: 'normal' }}>
              <Stack>
                <Typography variant="body2">{t(labelKey)}</Typography>
                <Typography variant="caption" color={theme.palette.text.disabled} aria-hidden="true">
                  {t(subtitleKey)}
                </Typography>
              </Stack>
            </MenuItem>
          ))}
        </StyledSelect>
      </Dialog>
    </ViewPopperContainer>
  );
};

export default LayoutSelection;
