// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Popover, Stack, styled } from '@mui/material';
import { useMemo, useEffect, useState } from 'react';

import LayoutOptions from '../../../../enums/LayoutOptions';
import { useAppSelector, useAppDispatch } from '../../../../hooks';
import { selectAllOnlineParticipants } from '../../../../store/slices/participantsSlice';
import { setPaginationPage, selectCinemaLayout, selectPaginationPageState } from '../../../../store/slices/uiSlice';
import PageIndex from './PageIndex';

const MAX_GRID_TILES_MOBILE = 9;

const Container = styled(Stack, {
  shouldForwardProp: (prop) => prop !== 'isVisible',
})<{ isVisible: boolean }>(({ theme, isVisible }) => ({
  background: theme.palette.background.video,
  borderRadius: '0.25rem',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  height: 'auto',
  visibility: isVisible ? 'visible' : 'hidden',

  '& .MuiPopover-paper': {
    marginTop: '0.7rem',
    background: theme.palette.background.defaultGradient,
  },
}));

const PopoverContainer = styled(Stack)(({ theme }) => ({
  display: 'flex',
  gap: '0.5rem',
  height: '100%',
  alignItems: 'space-between',
  padding: theme.spacing(1, 1),
  borderRadius: '0.1rem',
  background: theme.palette.background.video,
}));

const MobilePagination = () => {
  const dispatch = useAppDispatch();
  const participants = useAppSelector(selectAllOnlineParticipants);
  const selectedPage = useAppSelector(selectPaginationPageState);
  const selectedLayout = useAppSelector(selectCinemaLayout);
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const isPopoverOpen = Boolean(anchorElement);

  const pageCount = useMemo(() => {
    return Math.ceil(participants.length / MAX_GRID_TILES_MOBILE);
  }, [participants]);
  useEffect(() => {
    if (selectedPage > pageCount || selectedPage === 0) {
      dispatch(setPaginationPage(pageCount));
    }
  }, [selectedPage, pageCount, dispatch]);

  const handleChangePage = (page: number) => {
    dispatch(setPaginationPage(page));
    setAnchorElement(null);
  };

  const paginationPopover = [];
  for (let index = 1; index <= pageCount; index++) {
    if (index === selectedPage) {
      continue;
    }
    paginationPopover.push(<PageIndex key={index} index={index} handleClick={() => handleChangePage(index)} />);
  }

  return selectedLayout !== LayoutOptions.Grid ? (
    <Container isVisible={false}>{null}</Container>
  ) : (
    <Container isVisible={pageCount > 1}>
      <PageIndex
        aria-controls="page-selection-popover"
        aria-expanded={isPopoverOpen}
        index={selectedPage}
        highlighted
        handleClick={(event) => setAnchorElement(event.currentTarget)}
      />
      <Popover
        open={Boolean(anchorElement)}
        anchorEl={anchorElement}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        onClose={() => setAnchorElement(null)}
        disablePortal
      >
        <PopoverContainer id="page-selection-popover">{paginationPopover}</PopoverContainer>
      </Popover>
    </Container>
  );
};

export default MobilePagination;
