// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Button } from '@mui/material';
import { memo, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SortPopoverMenu } from '../../commonComponents';
import { SortItem, SortOption } from '../../types';

const items: Array<SortItem> = [
  {
    i18nKey: 'sort-name-asc',
    type: SortOption.NameASC,
  },
  {
    i18nKey: 'sort-name-dsc',
    type: SortOption.NameDESC,
  },
  {
    i18nKey: 'sort-first-join',
    type: SortOption.FirstJoin,
  },
  {
    i18nKey: 'sort-last-join',
    type: SortOption.LastJoin,
  },
  {
    i18nKey: 'sort-random',
    type: SortOption.Random,
  },
];

interface TalkingSortButtonProps {
  selectedSortType: SortOption;
  onChange(selectedSortType: SortOption): void;
  closeOnSelection?: boolean;
}

const TalkingStickSortButton = ({ selectedSortType, onChange }: TalkingSortButtonProps) => {
  const id = 'talking-stick-sort-popover';
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const anchor = useRef<HTMLButtonElement | null>(null);

  const selectedItem = useMemo(() => {
    return items.find((item) => item.type === selectedSortType) as SortItem;
  }, [selectedSortType]);

  const toggleExpandedState = () => setExpanded((current) => !current);

  return (
    <Box>
      <Button
        ref={anchor}
        type="button"
        aria-expanded={expanded}
        aria-controls={id}
        aria-haspopup="menu"
        onClick={toggleExpandedState}
      >
        {t(selectedItem.i18nKey)}
      </Button>
      {anchor.current && expanded && (
        <SortPopoverMenu
          id={id}
          anchorEl={anchor.current}
          isOpen={true}
          items={items}
          onClose={() => setExpanded(false)}
          selectedOptionType={selectedSortType}
          onChange={onChange}
        />
      )}
    </Box>
  );
};

export default memo(TalkingStickSortButton);
