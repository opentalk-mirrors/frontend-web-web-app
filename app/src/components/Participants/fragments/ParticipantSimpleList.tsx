// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { List, ListProps, styled } from '@mui/material';
import { FC } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';

import { Participant } from '../../../types';
import ParticipantListItem from './ParticipantListItem';

const CustomList = styled(List)(({ theme }) => ({
  overflow: 'hidden',
  textAlign: 'left',
  width: '100%',
  height: '100%',
  [theme.breakpoints.down('sm')]: {
    minHeight: '40vh',
  },
}));

interface ParticipantSimpleListProps extends ListProps {
  participants: Participant[];
}

const ParticipantSimpleList: FC<ParticipantSimpleListProps> = ({ participants, ...props }) => {
  const root = document.querySelector(':root');
  const DEFAULT_FONT_SIZE = 16; // "The default font size in all browsers tends to be approximately 16 pixels."

  return (
    <CustomList {...props}>
      <AutoSizer>
        {({ height, width }: { height: number; width: number }) => {
          const rootFontSize = root
            ? Number.parseFloat(window.getComputedStyle(root, null).getPropertyValue('font-size'))
            : DEFAULT_FONT_SIZE;
          const ITEM_SIZE_SCALE = 3.75; // On 16px base, 60px height is proper height for list item, therefore we got the scale of 3.75

          return (
            <FixedSizeList
              height={height}
              width={width}
              itemSize={rootFontSize * ITEM_SIZE_SCALE}
              itemCount={participants.length}
              itemData={participants}
              overscanCount={4}
              itemKey={(index: number, data: Participant[]) => data[index].id as string}
            >
              {ParticipantListItem}
            </FixedSizeList>
          );
        }}
      </AutoSizer>
    </CustomList>
  );
};

export default ParticipantSimpleList;
