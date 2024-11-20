// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled, Button, Box } from '@mui/material';
import { FormikProps } from 'formik';
import { Step, FormikWizard } from 'formik-wizard-form';
import { FormikValues } from 'formik/dist/types';
import i18next from 'i18next';
import { get, shuffle } from 'lodash';
import React, { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

import { start } from '../../../api/types/outgoing/breakout';
import { BackIcon, NoOfParticipantsIcon, NoOfRoomsIcon } from '../../../assets/icons';
import { AccordionItem, ErrorFormMessage, notifications } from '../../../commonComponents';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { selectCombinedParticipantsAndUser, selectCombinedParticipantsAndUserCount } from '../../../store/selectors';
import { Participant } from '../../../types';
import { spliceIntoChunks } from '../../../utils/arrayUtils';
import { Seconds } from '../../../utils/tsUtils';
import CreateByParticipantsForm from './CreateByParticipantsForm';
import CreateByRoomsForm from './CreateByRoomsForm';
import ParticipantsSelector, { BreakoutRoomWithFullParticipants } from './ParticipantsSelector';
import { AccordionOptions } from './constants';

type Expanded = string | false;

const Form = styled('form')({
  flex: 1,
  overflow: 'hidden',
});

class HandleSubmit extends React.Component<{ handleNext: () => void; formik: FormikProps<FormikValues> }> {
  componentDidMount() {
    if (this.props.formik.submitCount === 0) {
      this.props.handleNext();
    }
  }
  render() {
    return null;
  }
}

const validationSchema = () =>
  Yup.object({
    expanded: Yup.mixed<AccordionOptions>()
      .oneOf(Object.values(AccordionOptions), i18next.t('breakout-room-form-error-expanded'))
      .required(i18next.t('breakout-room-form-error-expanded')),
    rooms: Yup.object().when(['expanded'], {
      is: AccordionOptions.Rooms,
      then: Yup.object({
        rooms: Yup.number().min(2, i18next.t('breakout-room-form-error-min-room')),
      }),
    }),
    participants: Yup.object().when(['expanded'], {
      is: AccordionOptions.Participants,
      then: Yup.object().shape({
        participantsPerRoom: Yup.number().min(2, i18next.t('breakout-room-form-error-min-participants')),
      }),
    }),
  });

const CreateRoomsForm = () => {
  const [expanded, setExpanded] = React.useState<Expanded>(false);
  const dispatch = useAppDispatch();
  const participantsTotal = useAppSelector(selectCombinedParticipantsAndUserCount);
  const participants = useAppSelector(selectCombinedParticipantsAndUser);
  const insufficientParticipants = participantsTotal < 4;
  const { t } = useTranslation();
  const handleNextRef = useRef<() => void>();
  const handlePrevRef = useRef<() => void>();

  const handleNext = useCallback(() => {
    if (insufficientParticipants) {
      notifications.error(t('breakout-room-create-button-disabled'));
      return;
    }

    handleNextRef.current?.();
  }, [insufficientParticipants, t]);

  const handleChange =
    (panel: string, formik: FormikProps<FormikValues>) => (event: React.ChangeEvent<unknown>, newExpanded: boolean) => {
      const expanded = newExpanded ? panel : false;
      setExpanded(expanded);
      formik.setFieldValue('expanded', expanded);
      formik.setErrors({});
    };

  const handleStepBackOnParticipantSelector = (formik: FormikProps<FormikValues>) => {
    handlePrevRef.current?.();
    formik.setFieldValue(`${formik.values.expanded}.assignments`, []);
  };

  const steps: Step[] = React.useMemo(
    () => [
      {
        component: (formik) => (
          <Box overflow="auto" height="100%">
            <AccordionItem
              onChange={handleChange(AccordionOptions.Rooms, formik)}
              option={AccordionOptions.Rooms}
              expanded={expanded === AccordionOptions.Rooms}
              summaryText={t('breakout-room-tab-by-rooms')}
              summaryIcon={<NoOfRoomsIcon />}
            >
              <CreateByRoomsForm formName={AccordionOptions.Rooms} handleNext={handleNext} />
            </AccordionItem>
            <AccordionItem
              onChange={handleChange(AccordionOptions.Participants, formik)}
              option={AccordionOptions.Participants}
              expanded={expanded === AccordionOptions.Participants}
              summaryText={t('breakout-room-tab-by-participants')}
              summaryIcon={<NoOfParticipantsIcon />}
            >
              <CreateByParticipantsForm formName={AccordionOptions.Participants} handleNext={handleNext} />
            </AccordionItem>
            {formik.errors.expanded && <ErrorFormMessage helperText={t(formik.errors.expanded as string)} />}
          </Box>
        ),
        validationSchema: validationSchema(),
      },
      {
        component: (formik) => {
          const formState = get(formik.values, formik.values.expanded, undefined);
          return formState.distribution ? (
            <HandleSubmit handleNext={handleNextRef.current as () => void} formik={formik} />
          ) : (
            <Box display="flex" flexDirection="column" flex={1} height="100%" gap={1}>
              <Box>
                <Button
                  variant="text"
                  size="small"
                  startIcon={<BackIcon />}
                  onClick={() => handleStepBackOnParticipantSelector(formik)}
                >
                  {t('user-selection-button-back')}
                </Button>
              </Box>
              <Box overflow="hidden" flex={1}>
                <ParticipantsSelector
                  onSubmit={handleNextRef.current as () => void}
                  formName={formik.values.expanded}
                  name={`${formik.values.expanded}.assignments`}
                />
              </Box>
            </Box>
          );
        },
      },
    ],
    [expanded, t, handleNext]
  );

  const generateRandomAssignments = (rooms: number) => {
    const shuffledParticipants = shuffle(participants);
    const chunkedParticipants: Array<Array<Participant>> = spliceIntoChunks(shuffledParticipants, rooms);

    const breakoutRoomAssignments: BreakoutRoomWithFullParticipants[] = chunkedParticipants.map(
      (participants, index) => ({
        name: t('room', { roomNumber: index + 1 }),
        assignments: participants,
      })
    );
    return breakoutRoomAssignments;
  };

  const mapParticipantsToParticipantIds = (participants: Participant[]) =>
    participants.map((participant) => participant.id);

  const startByRooms = (values: FormikValues) => {
    const { duration, rooms, assignments, distribution } = get(values, values.expanded, undefined);
    let assignedParticipants = assignments as BreakoutRoomWithFullParticipants[];
    if (distribution) {
      assignedParticipants = generateRandomAssignments(rooms);
    }

    dispatch(
      start.action({
        duration: duration ? ((duration * 60) as Seconds) : undefined,
        strategy: 'manual',
        rooms: assignedParticipants.map((breakoutRoom) => ({
          ...breakoutRoom,
          assignments: mapParticipantsToParticipantIds(breakoutRoom.assignments),
        })),
      })
    );
  };

  const startByParticipants = (values: FormikValues) => {
    const { duration, participantsPerRoom, assignments, distribution } = get(values, values.expanded, undefined);
    const rooms = Math.floor(participantsTotal / participantsPerRoom);
    let assignedParticipants = assignments as BreakoutRoomWithFullParticipants[];
    if (distribution) {
      assignedParticipants = generateRandomAssignments(rooms);
    }

    dispatch(
      start.action({
        duration: duration ? ((duration * 60) as Seconds) : undefined,
        strategy: 'manual',
        rooms: assignedParticipants.map((breakoutRoom) => ({
          ...breakoutRoom,
          assignments: mapParticipantsToParticipantIds(breakoutRoom.assignments),
        })),
      })
    );
  };

  // todo include/exclude moderators
  const handleSubmit = (values: FormikValues) => {
    switch (values.expanded) {
      case AccordionOptions.Rooms:
        startByRooms(values);
        break;
      case AccordionOptions.Participants:
        startByParticipants(values);
        break;
      case AccordionOptions.Groups:
      case AccordionOptions.Moderators:
      default:
    }
  };

  return (
    <FormikWizard
      initialValues={{
        rooms: {
          duration: undefined,
          rooms: 2,
          distribution: false,
          includeModerators: false,
          assignments: [],
        },
        participants: {
          duration: undefined,
          participantsPerRoom: 2,
          distribution: false,
          includeModerators: false,
          assignments: [],
        },
        groups: {
          duration: undefined,
          includeModerators: false,
        },
        moderators: {
          duration: undefined,
          distribution: false,
          includeModerators: true,
          assignments: [],
        },
      }}
      onSubmit={handleSubmit}
      validateOnNext
      activeStepIndex={0}
      steps={steps}
      validateOnBlur={false}
      validateOnChange={false}
    >
      {({ renderComponent, handlePrev, handleNext }) => {
        handleNextRef.current = handleNext;
        handlePrevRef.current = handlePrev;
        return <Form>{renderComponent()}</Form>;
      }}
    </FormikWizard>
  );
};

export default CreateRoomsForm;
