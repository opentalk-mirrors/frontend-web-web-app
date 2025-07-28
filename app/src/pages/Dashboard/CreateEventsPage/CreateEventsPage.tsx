// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Step, StepLabel, Stepper, styled, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { CreateMeetingForm } from '../../../components/MeetingForms';
import { RequiredFieldsInfo } from '../../../components/RequiredFieldsInfo';
import { useUpdateDocumentTitle } from '../../../hooks/useUpdateDocumentTitle';

const Container = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gridTemplateRows: 'auto auto auto 1fr',
  height: '100%',
  overflow: 'hidden auto',
  gap: theme.spacing(2),
  background: theme.palette.background.main.primary,
  color: theme.palette.background.main.contrastText,
}));

const ActiveStep = styled(Step)(({ theme }) => ({
  //Safari icon, Other browsers icon
  '& .MuiSvgIcon-root.MuiStepIcon-root.Mui-active, & .MuiSvgIcon-root circle': {
    color: theme.palette.primary.main,
  },
}));

const CapitalizedStepLabel = styled(StepLabel)(({ theme }) => ({
  textTransform: 'capitalize',
  '& .MuiStepLabel-label': {
    color: theme.palette.background.main.contrastText,
  },
}));

const StyledStepLabel = styled(StepLabel)(({ theme }) => ({
  opacity: 0.85,
  '& .MuiStepLabel-labelContainer': {
    color: theme.palette.text.primary,
  },
  '& .MuiStepIcon-root': {
    color: theme.palette.text.primary,
  },
}));

const CreateEventsPage = () => {
  const { t } = useTranslation();
  const pageHeading = t('dashboard-meetings-create-title');

  useUpdateDocumentTitle(pageHeading);

  const StepperHeader = () => (
    <Stepper activeStep={0}>
      <ActiveStep>
        <CapitalizedStepLabel>{t('global-meeting', { count: 1 })}</CapitalizedStepLabel>
      </ActiveStep>
      <Step>
        <StyledStepLabel>{t('global-participants')}</StyledStepLabel>
      </Step>
    </Stepper>
  );

  return (
    <Container>
      <Typography component="h1">{pageHeading}</Typography>
      <StepperHeader />
      <RequiredFieldsInfo />
      <CreateMeetingForm />
    </Container>
  );
};

export default CreateEventsPage;
