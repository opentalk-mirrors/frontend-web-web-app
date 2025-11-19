// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Button } from '@mui/material';
import { useCallback, useId, useState } from 'react';
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

const TalkingStickSortButton = ({ selectedSortType, onChange, closeOnSelection = false }: TalkingSortButtonProps) => {
  const popoverId = useId();
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);

  const selectedItem = items.find((item) => item.type === selectedSortType) ?? items[0];

  const toggleExpandedState = useCallback(() => {
    setExpanded((current) => !current);
  }, []);

  const closePopover = useCallback(() => {
    setExpanded(false);
  }, []);

  const handleSelectionChange = useCallback(
    (nextSortType: SortOption) => {
      onChange(nextSortType);

      if (closeOnSelection) {
        setExpanded(false);
      }
    },
    [closeOnSelection, onChange]
  );

  const handleAnchorRef = useCallback((element: HTMLButtonElement | null) => {
    setAnchor(element);
  }, []);

  return (
    <Box>
      <Button
        ref={handleAnchorRef}
        type="button"
        aria-expanded={expanded}
        aria-controls={expanded ? popoverId : undefined}
        aria-haspopup="menu"
        onClick={toggleExpandedState}
      >
        {t(selectedItem.i18nKey)}
      </Button>
      {expanded && anchor && (
        <SortPopoverMenu
          id={popoverId}
          anchorEl={anchor}
          isOpen={expanded}
          items={items}
          onClose={closePopover}
          selectedOptionType={selectedSortType}
          onChange={handleSelectionChange}
        />
      )}
    </Box>
  );
};

export default TalkingStickSortButton;
