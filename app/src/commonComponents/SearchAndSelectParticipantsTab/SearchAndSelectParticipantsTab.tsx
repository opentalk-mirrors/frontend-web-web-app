// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Button, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { ParticipantId } from '../../types';
import ConditionalToolTip from '../ConditionalToolTip';
import SearchInput from './fragments/SearchInput';
import { SelectableParticipant } from './fragments/SelectParticipantsItem';
import SelectParticipantsList from './fragments/SelectParticipantsList';

type SelectParticipantsBoxProps = {
  handleAllClick: () => void;
  handleSelectedClick: () => void;
  handleSelectParticipant: (checked: boolean, participantId: ParticipantId) => void;
  participantsList: SelectableParticipant[];
  searchValue: string;
  handleSearchChange: (searchValue: string) => void;
  disableActions?: boolean;
  disableActionsTooltip?: string;
};

function SearchAndSelectParticipantsTab({
  handleAllClick,
  handleSelectedClick,
  handleSelectParticipant,
  searchValue,
  handleSearchChange,
  participantsList,
  disableActions = false,
  disableActionsTooltip,
}: SelectParticipantsBoxProps) {
  const { t } = useTranslation();
  const tooltipTitle = disableActionsTooltip ?? t('global-disabled');

  return (
    <Stack
      spacing={2}
      sx={{
        flex: 1,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <ConditionalToolTip showToolTip={disableActions} title={tooltipTitle}>
          <Box component="span" sx={{ flex: 1, display: 'inline-flex' }}>
            <Button disabled={disableActions} onClick={handleAllClick} fullWidth color="secondary">
              {t('global-all')}
            </Button>
          </Box>
        </ConditionalToolTip>
        <ConditionalToolTip showToolTip={disableActions} title={tooltipTitle}>
          <Box component="span" sx={{ flex: 1, display: 'inline-flex' }}>
            <Button disabled={disableActions} onClick={handleSelectedClick} fullWidth color="secondary">
              {t('global-selected')}
            </Button>
          </Box>
        </ConditionalToolTip>
      </Box>
      <SearchInput searchValue={searchValue} onSearch={handleSearchChange} />
      <Box
        sx={{
          overflow: 'auto',
        }}
      >
        <SelectParticipantsList participantsList={participantsList} onCheck={handleSelectParticipant} />
      </Box>
    </Stack>
  );
}

export default SearchAndSelectParticipantsTab;
