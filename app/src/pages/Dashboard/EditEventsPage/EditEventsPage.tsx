// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, StepButton as MuiStepButton, Skeleton, Stack, Step, Stepper, Typography, styled } from '@mui/material';
import { EventId } from '@opentalk/rest-api-rtk-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { useGetEventQuery } from '../../../api/rest';
import { EditIcon } from '../../../assets/icons';
import InviteToMeeting from '../../../components/InviteToMeeting';
import { UpdateMeetingForm } from '../../../components/MeetingForms';
import { RequiredFieldsInfo } from '../../../components/RequiredFieldsInfo';
import { useUpdateDocumentTitle } from '../../../hooks/useUpdateDocumentTitle';

const getInitialStep = (step?: string) => {
  const parsedStep = step ? Number.parseInt(step, 10) : NaN;

  return Number.isNaN(parsedStep) ? 0 : parsedStep;
};

const steps = [
  {
    label: 'global-meeting',
    options: {
      count: 1,
    },
  },
  {
    label: 'global-participants',
  },
];

const StepButton = styled(MuiStepButton)(({ theme }) => ({
  padding: 0,
  margin: 0,
  textTransform: 'capitalize',
  '& .MuiStepLabel-label': {
    background: theme.palette.background.main.primary,
    color: theme.palette.background.main.contrastText,
    opacity: 0.9,
  },
  '& .MuiStepLabel-label.Mui-disabled': {
    opacity: 1,
  },
  '& .MuiStepLabel-label.Mui-completed': {
    background: theme.palette.background.main.primary,
    color: theme.palette.background.main.contrastText,
    opacity: 0.9,
  },
  '& .MuiStepLabel-label.Mui-active': {
    color: theme.palette.primary.main,
  },
  '&:not(.Mui-disabled) .MuiStepLabel-iconContainer .MuiSvgIcon-root': {
    background: theme.palette.background.highlightContrast.primary,
  },
}));

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

const MAX_INVITEES = 10;

type StepperHeaderProps = {
  activeStep: number;
  onStepChange: (step: number) => void;
  translate: ReturnType<typeof useTranslation>['t'];
};

const StepperHeader = ({ activeStep, onStepChange, translate }: StepperHeaderProps) => (
  <Stepper activeStep={activeStep}>
    {steps.map(({ label, options }, index) => (
      <Step key={label} disabled={activeStep === index}>
        <StepButton icon={activeStep !== index && <EditIcon />} onClick={() => onStepChange(index)}>
          {translate(label, options)}
        </StepButton>
      </Step>
    ))}
  </Stepper>
);

const PlaceholderSkeleton = () => (
  <Stack spacing={2}>
    <Stack spacing={1}>
      <Skeleton variant="text" width={450} />
      <Skeleton variant="rectangular" height={40} />
    </Stack>
    <Stack spacing={1}>
      <Skeleton variant="text" width={250} />
      <Skeleton variant="rectangular" height={40} />
    </Stack>
  </Stack>
);

const EditEventsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { eventId, formStep } = useParams<'eventId' | 'formStep'>() as { eventId: EventId; formStep?: string };
  const [activeStep, setActiveStep] = useState(() => getInitialStep(formStep));
  const { data: event, isLoading, error, refetch } = useGetEventQuery({ eventId: eventId, inviteesMax: MAX_INVITEES });
  const pageHeading = t('dashboard-meetings-create-title');
  useUpdateDocumentTitle(pageHeading);

  useEffect(() => {
    if (!isLoading && !event && error) {
      navigate('/dashboard/meetings/create');
    }
  }, [event, isLoading, navigate, error]);

  if (isLoading) {
    return (
      <Container>
        <StepperHeader activeStep={activeStep} onStepChange={setActiveStep} translate={t} />
        <PlaceholderSkeleton />
      </Container>
    );
  }

  return (
    <Container>
      <Typography component="h1">{pageHeading}</Typography>
      <StepperHeader activeStep={activeStep} onStepChange={setActiveStep} translate={t} />
      <RequiredFieldsInfo />
      {activeStep === 0 && event && (
        <UpdateMeetingForm existingEvent={event} onForwardButtonClick={() => setActiveStep(1)} />
      )}
      {activeStep === 1 && event && (
        <InviteToMeeting
          isUpdatable={true}
          existingEvent={event}
          onBackButtonClick={() => setActiveStep(0)}
          invitationsSent={() => refetch()}
        />
      )}
    </Container>
  );
};

export default EditEventsPage;
