// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, Stack } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { useAppSelector } from '../../hooks';
import { selectSavedLegalVotePerId } from '../../store/slices/legalVoteSlice';
import { selectCurrentRoomMode } from '../../store/slices/roomSlice';
import CreateLegalVoteForm from './fragments/CreateLegalVoteForm';
import LegalVoteOverview from './fragments/LegalVoteOverview';

const LegalVoteTab = () => {
  const [showLegalVoteForm, setShowLegalVoteForm] = useState(false);
  const [savedLegalVoteFormId, setSavedLegalVoteFormId] = useState<number | undefined>();
  const currentRoomMode = useAppSelector(selectCurrentRoomMode);
  const isCoffeeBreakActive = currentRoomMode === 'coffee-break';
  const formValues = useSelector(selectSavedLegalVotePerId(savedLegalVoteFormId));
  const { t } = useTranslation();

  const handleOnClickSavedLegalVoteItem = (id: number | undefined) => {
    setSavedLegalVoteFormId(id);
    setShowLegalVoteForm(true);
  };

  const handleOnClose = () => {
    setSavedLegalVoteFormId(undefined);
    setShowLegalVoteForm(false);
  };

  const renderLegalVoteOverview = () => {
    return (
      <Stack
        spacing={1}
        sx={{
          flex: 1,
          overflow: 'hidden',
          padding: 1,
        }}
      >
        <LegalVoteOverview onClickItem={handleOnClickSavedLegalVoteItem} />
        <Button onClick={() => setShowLegalVoteForm(true)}>{t('legal-vote-overview-button-create-vote')}</Button>
      </Stack>
    );
  };

  const renderCreateLegalVoteForm = () => {
    return (
      <CreateLegalVoteForm
        isCoffeeBreakActive={isCoffeeBreakActive}
        initialValues={formValues}
        onClose={handleOnClose}
      />
    );
  };

  return showLegalVoteForm ? renderCreateLegalVoteForm() : renderLegalVoteOverview();
};

export default LegalVoteTab;
