// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, Stack, styled } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from '../../hooks';
import { selectSavedLegalVotePerId } from '../../store/slices/legalVoteSlice';
import { selectCurrentRoomMode } from '../../store/slices/roomSlice';
import CreateLegalVoteForm from './fragments/CreateLegalVoteForm';
import LegalVoteOverview from './fragments/LegalVoteOverview';

const LegalVoteOverviewContainer = styled(Stack)({
  flex: 1,
  overflow: 'hidden',
  padding: 1,
});

const LegalVoteTab = () => {
  const [showLegalVoteForm, setShowLegalVoteForm] = useState(false);
  const [savedLegalVoteFormId, setSavedLegalVoteFormId] = useState<number | undefined>();
  const currentRoomMode = useAppSelector(selectCurrentRoomMode);
  const isCoffeeBreakActive = currentRoomMode === 'coffee-break';
  const formValues = useAppSelector((state) => selectSavedLegalVotePerId(state, savedLegalVoteFormId));
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
      <LegalVoteOverviewContainer spacing={1}>
        <LegalVoteOverview onClickItem={handleOnClickSavedLegalVoteItem} />
        <Button onClick={() => setShowLegalVoteForm(true)} color="secondary">
          {t('legal-vote-overview-button-create-vote')}
        </Button>
      </LegalVoteOverviewContainer>
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
