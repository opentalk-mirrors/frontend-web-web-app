// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Pagination, styled } from '@mui/material';
import React, { useMemo, useEffect, useCallback, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { MeetingNotesIcon, WhiteboardIcon } from '../../../assets/icons';
import { ReactComponent as Logo } from '../../../assets/images/logo.svg';
import LayoutOptions from '../../../enums/LayoutOptions';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { selectPollsAndVotingsCount } from '../../../store/selectors';
import { selectMeetingNotesUrl } from '../../../store/slices/meetingNotesSlice';
import { selectAllOnlineParticipants } from '../../../store/slices/participantsSlice';
import { selectIsSharedFolderAvailable } from '../../../store/slices/sharedFolderSlice';
import {
  selectCinemaLayout,
  selectIsCurrentMeetingNotesHighlighted,
  selectPaginationPageState,
  setPaginationPage,
  toggleDebugMode,
  updatedCinemaLayout,
} from '../../../store/slices/uiSlice';
import { selectIsCurrentWhiteboardHighlighted } from '../../../store/slices/uiSlice';
import { selectIsWhiteboardAvailable } from '../../../store/slices/whiteboardSlice';
import { MAX_GRID_TILES } from '../../GridView/GridView';
import LayoutSelection from './LayoutSelection';
import { MeetingHeaderButton } from './MeetingHeaderButton';
import MeetingUtilsSection from './MeetingUtilsSection';
import MyMeetingMenu from './MyMeetingMenu';
import RoomTitle from './RoomTitle';
import { SharedFolderPopover } from './SharedFolderPopover';
import VotesAndPollsResultsPopover from './VotesAndPollsResultsPopover';

const OpenTalkLogo = styled(Logo)(({ theme }) => ({
  width: theme.typography.pxToRem(150),
  height: theme.typography.pxToRem(35),
  fill: 'white',
}));

const HeaderItem = styled('div')<{ highlighted?: boolean }>(({ theme, highlighted }) => ({
  background: highlighted ? theme.palette.primary.main : theme.palette.background.video,
  borderRadius: '0.25rem',
  display: 'inline-flex',
  padding: theme.spacing(0.9),
  justifyContent: 'center',
  alignItems: 'center',
  '& .MuiIconButton-root .MuiSvgIcon-root': {
    fill: highlighted ? theme.palette.background.default : theme.palette.text.primary,
  },
}));

const HeaderPagination = styled(Pagination)(({ theme }) => ({
  '& .MuiPaginationItem-root:hover': {
    color: theme.palette.primary.main,
    fontWeight: 'bold',
  },
  '& .Mui-selected': {
    color: theme.palette.primary.main,
    borderColor: theme.palette.primary.main,
  },
}));

const HeaderContainer = styled('div', {
  shouldForwardProp: (prop) => !['lgOrder', 'fullWidth', 'justifyContentLgDown', 'wrap'].includes(prop as string),
})<{
  justifyContentLgDown?: string;
  wrap?: boolean;
  flex?: number;
}>(({ theme, justifyContentLgDown, wrap, flex }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  justifyContent: 'center',
  flexWrap: wrap ? 'wrap' : 'nowrap',
  flex,
  [theme.breakpoints.down('lg')]: {
    justifyContent: justifyContentLgDown ? justifyContentLgDown : 'center',
  },
}));

const LogoContainer = styled(HeaderContainer)(({ theme }) => ({
  [theme.breakpoints.down('lg')]: {
    display: 'none',
  },
}));

const Content = styled('header')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  justifyContent: 'space-between',
  flexWrap: 'nowrap',
  alignItems: 'flex-start',
  [theme.breakpoints.down('lg')]: {
    flexWrap: 'wrap',
  },
}));

const RoomTitleContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  [theme.breakpoints.down('lg')]: {
    justifyContent: 'flex-start',
  },
}));

const DesktopMeetingHeader = () => {
  const dispatch = useAppDispatch();
  const selectedLayout = useAppSelector(selectCinemaLayout);
  const participants = useAppSelector(selectAllOnlineParticipants);
  const selectedPage = useAppSelector(selectPaginationPageState);
  const meetingNotesUrl = useAppSelector(selectMeetingNotesUrl);
  const isWhiteboardAvailable = useAppSelector(selectIsWhiteboardAvailable);
  const isCurrentWhiteboardHighlighted = useAppSelector(selectIsCurrentWhiteboardHighlighted);
  const isCurrentMeetingNotesHighlighted = useAppSelector(selectIsCurrentMeetingNotesHighlighted);
  const showWhiteboardIcon = isWhiteboardAvailable && selectedLayout !== LayoutOptions.Whiteboard;
  const votingsAndPollsCount = useAppSelector(selectPollsAndVotingsCount);
  const showVotesAndPolls = votingsAndPollsCount > 0;
  const isSharedFolderAvailable = useAppSelector(selectIsSharedFolderAvailable);
  const { t } = useTranslation();
  const isMeetingNotesActive = selectedLayout === LayoutOptions.MeetingNotes;
  const isWhiteboardActive = selectedLayout === LayoutOptions.Whiteboard;
  const [clickCount, setClickCount] = useState(0);
  const clickTimer = useRef<NodeJS.Timeout | null>(null);

  const showDebugDialog = () => {
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
    }

    clickTimer.current = setTimeout(() => {
      setClickCount(0);
    }, 2000);

    setClickCount((clickCount) => clickCount + 1);
  };

  useEffect(() => {
    if (clickCount === 5) {
      dispatch(toggleDebugMode());
      setClickCount(0);
    }
  }, [dispatch, clickCount]);

  const pageCount = useMemo(() => {
    return Math.ceil(participants.length / MAX_GRID_TILES);
  }, [participants]);

  useEffect(() => {
    if (selectedPage > pageCount || selectedPage === 0) {
      dispatch(setPaginationPage(pageCount));
    }
  }, [selectedPage, pageCount, dispatch]);

  const handleChangePage = (event: React.ChangeEvent<unknown>, page: number) => {
    dispatch(setPaginationPage(page));
  };

  const handleSelectedView = useCallback(
    (layout: LayoutOptions) => {
      dispatch(updatedCinemaLayout(layout));
    },
    [dispatch]
  );

  const handleMeetingNotesClick = useCallback(() => {
    if (selectedLayout !== LayoutOptions.MeetingNotes) {
      handleSelectedView(LayoutOptions.MeetingNotes);
    }
  }, [selectedLayout, handleSelectedView]);

  const isAnyFeatureActive = Boolean(
    showWhiteboardIcon || meetingNotesUrl || showVotesAndPolls || isSharedFolderAvailable
  );

  const isPaginationVisible = pageCount > 1;

  const renderMeetingNotesButton = () => {
    return (
      <MeetingHeaderButton
        active={isCurrentMeetingNotesHighlighted}
        onClick={handleMeetingNotesClick}
        aria-label={t('meeting-notes-button-show')}
        aria-pressed={isMeetingNotesActive}
      >
        <MeetingNotesIcon />
      </MeetingHeaderButton>
    );
  };

  const handleWhiteboardClick = useCallback(() => {
    if (selectedLayout !== LayoutOptions.Whiteboard) {
      handleSelectedView(LayoutOptions.Whiteboard);
    }
  }, [selectedLayout, handleSelectedView]);

  const renderWhiteboardButton = () => (
    <MeetingHeaderButton
      active={isCurrentWhiteboardHighlighted}
      onClick={handleWhiteboardClick}
      aria-label={t('whiteboard-start-whiteboard-button')}
      aria-pressed={isWhiteboardActive}
    >
      <WhiteboardIcon />
    </MeetingHeaderButton>
  );

  return (
    <Content>
      <LogoContainer>
        <OpenTalkLogo onClick={showDebugDialog} aria-disabled />
      </LogoContainer>
      <HeaderContainer justifyContentLgDown="flex-start" wrap flex={1}>
        <RoomTitleContainer>
          <RoomTitle />
          <LayoutSelection />
        </RoomTitleContainer>
        {selectedLayout === LayoutOptions.Grid && isPaginationVisible && (
          <HeaderItem>
            <HeaderPagination
              count={isPaginationVisible ? pageCount : 0}
              page={selectedPage}
              variant="outlined"
              shape="rounded"
              siblingCount={1}
              size="small"
              hidePrevButton
              hideNextButton
              onChange={handleChangePage}
            />
          </HeaderItem>
        )}

        {isAnyFeatureActive && (
          <>
            {showWhiteboardIcon && renderWhiteboardButton()}
            {meetingNotesUrl && selectedLayout !== LayoutOptions.MeetingNotes && renderMeetingNotesButton()}
            {isSharedFolderAvailable && <SharedFolderPopover />}
            {showVotesAndPolls && <VotesAndPollsResultsPopover />}
          </>
        )}
      </HeaderContainer>
      <HeaderContainer justifyContentLgDown="flex-end">
        <MeetingUtilsSection />
        <MyMeetingMenu />
      </HeaderContainer>
    </Content>
  );
};

export default DesktopMeetingHeader;
