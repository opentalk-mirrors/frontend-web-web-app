// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, Stack, styled } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from '../../hooks';
import { selectSavedPollPerId } from '../../store/slices/pollSlice';
import CreatePollForm from './fragments/CreatePollForm';
import PollOverview from './fragments/PollOverview';

const PollOverviewContainer = styled(Stack)({
  flex: 1,
  overflow: 'hidden',
});

const PollTab = () => {
  const [showPollForm, setShowPollForm] = useState(false);
  const [savedPollFormId, setSavedPollFormId] = useState<number | undefined>();
  const formValues = useAppSelector(selectSavedPollPerId(savedPollFormId));
  const { t } = useTranslation();

  const handleOnClickSavedPollItem = (id: number | undefined) => {
    setSavedPollFormId(id);
    setShowPollForm(true);
  };

  const handleOnClose = () => {
    setSavedPollFormId(undefined);
    setShowPollForm(false);
  };

  const renderPollOverview = () => {
    return (
      <PollOverviewContainer spacing={1} padding={1}>
        <PollOverview onClickItem={handleOnClickSavedPollItem} />
        <Button onClick={() => setShowPollForm(true)}>{t('poll-overview-button-create-poll')}</Button>
      </PollOverviewContainer>
    );
  };

  const renderPollForm = () => {
    return <CreatePollForm initialValues={formValues} onClose={handleOnClose} />;
  };

  return showPollForm ? renderPollForm() : renderPollOverview();
};

export default PollTab;
