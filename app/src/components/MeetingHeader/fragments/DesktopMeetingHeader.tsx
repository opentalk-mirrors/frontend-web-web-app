// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Divider, Pagination, styled } from '@mui/material';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { LogoIcon, MeetingNotesIcon, WhiteboardIcon } from '../../../assets/icons';
import { MAX_GRID_TILES_DESKTOP } from '../../../constants';
import LayoutOptions from '../../../enums/LayoutOptions';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { selectPollsAndVotingCount } from '../../../store/selectors';
import { selectMeetingNotesUrl } from '../../../store/slices/meetingNotesSlice';
import { selectAllOnlineParticipants } from '../../../store/slices/participantsSlice';
import { selectIsSharedFolderAvailable } from '../../../store/slices/sharedFolderSlice';
import {
  selectCinemaLayout,
  selectIsCurrentMeetingNotesHighlighted,
  selectPaginationPageState,
  setPaginationPage,
  updatedCinemaLayout,
  selectCinemaGridSize,
  selectIsCurrentWhiteboardHighlighted,
} from '../../../store/slices/uiSlice';
import { selectIsWhiteboardAvailable } from '../../../store/slices/whiteboardSlice';
import LayoutSelection from './LayoutSelection';
import { MeetingHeaderButton } from './MeetingHeaderButton';
import MeetingUtilsSection from './MeetingUtilsSection';
import MyMeetingMenu from './MyMeetingMenu';
import RoomTitle from './RoomTitle';
import { SharedFolderPopover } from './SharedFolderPopover';
import VotesAndPollsResultsPopover from './VotesAndPollsResultsPopover';

const OpenTalkLogo = styled(LogoIcon)(({ theme }) => ({
  width: 'auto',
  height: theme.typography.pxToRem(35),
  fill: theme.palette.text.primary,
}));

const HeaderItem = styled('div')<{ highlighted?: boolean }>(({ theme, highlighted }) => ({
  background: highlighted ? theme.palette.secondary.main : theme.palette.background.customPaper.primary,
  borderRadius: '0.25rem',
  display: 'inline-flex',
  padding: theme.spacing(0.9),
  justifyContent: 'center',
  alignItems: 'center',
  '& .MuiIconButton-root .MuiSvgIcon-root': {
    fill: highlighted ? theme.palette.secondary.contrastText : theme.palette.background.customPaper.contrastText,
  },
}));

const HeaderPagination = styled(Pagination)(({ theme }) => ({
  '& .MuiPaginationItem-root:hover': {
    color: theme.palette.secondary.main,
    fontWeight: 'bold',
  },
  '& .Mui-selected': {
    color: theme.palette.secondary.main,
    borderColor: theme.palette.secondary.main,
  },
}));

const HeaderContainer = styled('div', {
  shouldForwardProp: (prop) =>
    !['lgOrder', 'fullWidth', 'justifyContentLgDown', 'wrap', 'flex'].includes(prop as string),
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

const HeaderDivider = styled(Divider)(({ theme }) => ({
  height: '1.2rem',
  alignSelf: 'center',
  backgroundColor: theme.palette.divider,
  margin: theme.spacing(0, 1),
}));

const LogoContainer = styled(HeaderContainer)(({ theme }) => ({
  [theme.breakpoints.down('lg')]: {
    display: 'none',
  },
}));

const Content = styled('header')(({ theme }) => ({
  gridArea: 'header',
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
  const selectedGridSize = useAppSelector(selectCinemaGridSize);
  const isCurrentWhiteboardHighlighted = useAppSelector(selectIsCurrentWhiteboardHighlighted);
  const isCurrentMeetingNotesHighlighted = useAppSelector(selectIsCurrentMeetingNotesHighlighted);
  const showWhiteboardIcon = isWhiteboardAvailable && selectedLayout !== LayoutOptions.Whiteboard;
  const votingAndPollsCount = useAppSelector(selectPollsAndVotingCount);
  const showVotesAndPolls = votingAndPollsCount > 0;
  const isSharedFolderAvailable = useAppSelector(selectIsSharedFolderAvailable);
  const { t } = useTranslation();
  const isMeetingNotesActive = selectedLayout === LayoutOptions.MeetingNotes;
  const isWhiteboardActive = selectedLayout === LayoutOptions.Whiteboard;

  const gridSize = selectedGridSize >= MAX_GRID_TILES_DESKTOP ? MAX_GRID_TILES_DESKTOP : selectedGridSize;

  const pageCount = Math.ceil(participants.length / gridSize);

  useEffect(() => {
    if (selectedPage > pageCount || selectedPage === 0) {
      dispatch(setPaginationPage(pageCount));
    }
  }, [selectedPage, pageCount, dispatch]);

  const handleChangePage = (_event: React.ChangeEvent<unknown>, page: number) => {
    dispatch(setPaginationPage(page));
  };

  const handleSelectedView = (layout: LayoutOptions) => {
    dispatch(updatedCinemaLayout({ layout }));
  };

  const handleMeetingNotesClick = () => {
    if (selectedLayout !== LayoutOptions.MeetingNotes) {
      handleSelectedView(LayoutOptions.MeetingNotes);
    }
  };

  const isAnyFeatureActive = Boolean(
    showWhiteboardIcon || meetingNotesUrl || showVotesAndPolls || isSharedFolderAvailable
  );

  const isPaginationVisible = pageCount > 1;
  const showPagination = isPaginationVisible && selectedLayout === LayoutOptions.Grid;

  const handleWhiteboardClick = () => {
    if (selectedLayout !== LayoutOptions.Whiteboard) {
      handleSelectedView(LayoutOptions.Whiteboard);
    }
  };

  return (
    <Content>
      <LogoContainer>
        <OpenTalkLogo aria-disabled />
      </LogoContainer>
      <HeaderContainer justifyContentLgDown="flex-start" wrap flex={1}>
        <RoomTitleContainer>
          <RoomTitle />
          <LayoutSelection />
        </RoomTitleContainer>
        {showPagination && (
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
            <HeaderDivider orientation="vertical" />
            {showWhiteboardIcon && (
              <MeetingHeaderButton
                active={isCurrentWhiteboardHighlighted}
                onClick={handleWhiteboardClick}
                aria-label={t('whiteboard-start-whiteboard-button')}
                aria-pressed={isWhiteboardActive}
              >
                <WhiteboardIcon />
              </MeetingHeaderButton>
            )}
            {meetingNotesUrl && selectedLayout !== LayoutOptions.MeetingNotes && (
              <MeetingHeaderButton
                active={isCurrentMeetingNotesHighlighted}
                onClick={handleMeetingNotesClick}
                aria-label={t('meeting-notes-button-show')}
                aria-pressed={isMeetingNotesActive}
              >
                <MeetingNotesIcon />
              </MeetingHeaderButton>
            )}
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
