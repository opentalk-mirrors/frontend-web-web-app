// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Step, StepLabel, Stepper, styled, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import CreateOrUpdateMeetingForm from '../../../components/CreateOrUpdateMeetingForm';
import { RequiredFieldsInfo } from '../../../components/RequiredFieldsInfo';
import { useUpdateDocumentTitle } from '../../../hooks/useUpdateDocumentTitle';

const Container = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gridTemplateRows: 'auto auto auto 1fr',
  height: '100%',
  overflow: 'hidden auto',
  gap: theme.spacing(2),
}));

const ActiveStep = styled(Step)(({ theme }) => ({
  //Safari icon, Other browsers icon
  '& .MuiSvgIcon-root.MuiStepIcon-root.Mui-active, & .MuiSvgIcon-root circle': {
    color: theme.palette.secondary.dark,
  },
}));

const CapitalizedStepLabel = styled(StepLabel)({
  textTransform: 'capitalize',
});

const CreateEventsPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const { t } = useTranslation();
  const pageHeading = t('dashboard-meetings-create-title');

  useUpdateDocumentTitle(pageHeading);

  const StepperHeader = () => (
    <Stepper activeStep={0}>
      <ActiveStep>
        <CapitalizedStepLabel>{t('global-meeting', { count: 1 })}</CapitalizedStepLabel>
      </ActiveStep>
      <Step>
        <StepLabel>{t('global-participants')}</StepLabel>
      </Step>
    </Stepper>
  );

  return (
    <Container>
      <Typography component="h1">{pageHeading}</Typography>
      <StepperHeader />
      <RequiredFieldsInfo />
      {activeStep === 0 && <CreateOrUpdateMeetingForm onForwardButtonClick={() => setActiveStep(1)} />}
    </Container>
  );
};

export default CreateEventsPage;
