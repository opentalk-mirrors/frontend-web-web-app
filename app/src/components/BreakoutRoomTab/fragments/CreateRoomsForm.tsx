// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Button, MenuItem, Select, Stack, Switch, styled } from '@mui/material';
import { FormikValues, useFormik } from 'formik';
import i18next from 'i18next';
import { intersectionBy, reduce, shuffle } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

import { start } from '../../../api/types/outgoing/breakout';
import { CommonFormItem, CommonTextField, DurationField, ErrorFormMessage } from '../../../commonComponents';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { selectCombinedParticipantsAndUser, selectCombinedParticipantsAndUserCount } from '../../../store/selectors';
import { Participant } from '../../../types';
import { spliceIntoChunks } from '../../../utils/arrayUtils';
import { formikDurationFieldProps, formikProps, formikSwitchProps } from '../../../utils/formikUtils';
import { generateUniqueId } from '../../../utils/stringUtils';
import { Seconds } from '../../../utils/tsUtils';
import { DurationFieldWrapper } from '../../DurationFieldWrapper';
import TextWithDivider from '../../TextWithDivider';
import ParticipantsSelector from './ParticipantsSelector';
import { DropdownOptions } from './constants';

const Form = styled('form')({
  flex: 1,
  overflow: 'hidden',
});

const NumberInput = styled(CommonTextField)(({ theme }) => ({
  width: '4rem',
  '& input': {
    paddingRight: theme.spacing(0),
    textAlign: 'center',
  },
}));

const validationSchema = Yup.object({
  selectionMode: Yup.mixed<DropdownOptions>()
    .oneOf([...Object.values(DropdownOptions)], i18next.t('breakout-room-form-error-expanded'))
    .required(i18next.t('breakout-room-form-error-expanded')),
  rooms: Yup.number().when('selectionMode', ([selectionMode], schema, context) =>
    selectionMode === DropdownOptions.Rooms
      ? schema
          .min(1, i18next.t('breakout-room-form-error-min-rooms'))
          .max(context.context.maxRooms, i18next.t('breakout-room-form-error-max-rooms'))
      : schema
  ),
  participantsPerRoom: Yup.number().when('selectionMode', ([selectionMode], schema, context) =>
    selectionMode === DropdownOptions.Participants
      ? schema
          .min(1, i18next.t('breakout-room-form-error-min-participants'))
          .max(context.context.maxParticipantsPerRoom, i18next.t('breakout-room-form-error-max-participants'))
      : schema
  ),
});

export interface BreakoutRoomWithFullParticipants {
  name: string;
  assignments: Participant[];
}

interface CreateRoomsFormikValues {
  selectionMode: DropdownOptions;
  duration?: Seconds;
  distribution: boolean;
  assignments: BreakoutRoomWithFullParticipants[];
  rooms: number;
  participantsPerRoom: number;
  maxParticipantsPerRoom: number;
  maxRooms: number;
}

const MINIMUM_NUMBER_OF_ROOMS = 2;

const CreateRoomsForm = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const participants = useAppSelector(selectCombinedParticipantsAndUser);
  const participantsTotal = useAppSelector(selectCombinedParticipantsAndUserCount);
  const [error, setError] = useState<string | null>(null);

  const generateRandomAssignments = (rooms: number) => {
    const shuffled = shuffle(participants);
    return spliceIntoChunks(shuffled, rooms).map((group, i) => ({
      name: t('room', { roomNumber: i + 1 }),
      assignments: group,
    }));
  };

  const mapToIds = (participants: Participant[]) => participants.map((p) => p.participantId);

  const toRoomPayload = (assignments: BreakoutRoomWithFullParticipants[]) =>
    assignments.map((room) => ({
      ...room,
      assignments: mapToIds(room.assignments),
    }));

  const handleSubmit = (values: CreateRoomsFormikValues, { setSubmitting }: FormikValues) => {
    const { duration, assignments, distribution } = values;

    const calculatedRooms =
      values.selectionMode === DropdownOptions.Rooms
        ? values.rooms
        : Math.floor(participantsTotal / values.participantsPerRoom);

    const actualAssignments = distribution ? generateRandomAssignments(calculatedRooms) : assignments;

    dispatch(
      start.action({
        duration: duration && ((duration * 60) as Seconds),
        strategy: 'manual',
        rooms: toRoomPayload(actualAssignments),
      })
    );

    setSubmitting(false);
  };

  const maxParticipantsPerRoom = Math.max(2, participantsTotal);
  const maxRooms = Math.max(2, Math.floor(participantsTotal / MINIMUM_NUMBER_OF_ROOMS));

  const formik = useFormik<CreateRoomsFormikValues>({
    initialValues: {
      selectionMode: DropdownOptions.Rooms,
      duration: undefined,
      distribution: false,
      assignments: [],
      rooms: participantsTotal === 1 ? 1 : 2,
      participantsPerRoom: participantsTotal === 1 ? 1 : 2,
      maxParticipantsPerRoom,
      maxRooms,
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: false,
    onSubmit: handleSubmit,
  });

  const deleteOfflineParticipantsFromAssignments = useCallback(
    (assignments: BreakoutRoomWithFullParticipants[]) =>
      assignments.map((room) => {
        return {
          ...room,
          assignments: intersectionBy(room.assignments, participants, 'id'),
        };
      }),
    [participants]
  );

  useEffect(() => {
    formik.setFieldValue('assignments', deleteOfflineParticipantsFromAssignments(formik.values.assignments));
    // todo fix this eslint with a  proper refactoring of the breakout rooms form
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteOfflineParticipantsFromAssignments, participants]);

  const ariaId = generateUniqueId();

  const { calculatedParticipantsPerRoom, roomCreationInfoText } = useMemo(() => {
    if (formik.values.selectionMode === DropdownOptions.Rooms) {
      const calculatedParticipantsPerRoom = Math.max(2, Math.floor(participantsTotal / formik.values.rooms + 0.5));
      return {
        calculatedParticipantsPerRoom,
        roomCreationInfoText: t('breakout-room-rooms-created-by-participants', { rooms: formik.values.rooms }),
      };
    }

    return {
      calculatedParticipantsPerRoom: formik.values.participantsPerRoom,
      roomCreationInfoText: t('breakout-room-assignable-participants-per-rooms', {
        participantsPerRoom: `${formik.values.participantsPerRoom}-${formik.values.participantsPerRoom + 1}`,
      }),
    };
  }, [formik.values.selectionMode, formik.values.rooms, formik.values.participantsPerRoom, participantsTotal, t]);

  const allParticipantsAssigned = () => {
    const assignedParticipantsCount = reduce(
      formik.values.assignments,
      (acc, { assignments }) => acc + assignments.length,
      0
    );
    return assignedParticipantsCount === participants.length;
  };

  const validateAssignments = (maxPerRoom: number) => {
    const valid =
      formik.values.assignments.every(
        ({ assignments }) => assignments.length > 0 && assignments.length <= maxPerRoom
      ) && allParticipantsAssigned();
    return {
      valid,
      error: valid ? null : t('user-selection-error-invalid-room-assignments'),
    };
  };

  const validateBreakoutRoomAssignment = (): { valid: boolean; error: string | null } => {
    if (formik.values.selectionMode === DropdownOptions.Rooms) {
      return validateAssignments(Math.ceil(participants.length / formik.values.rooms));
    }
    if (formik.values.selectionMode === DropdownOptions.Participants) {
      return validateAssignments(calculatedParticipantsPerRoom);
    }
    return {
      valid: true,
      error: null,
    };
  };

  const customSubmit = () => {
    if (formik.values.distribution) {
      formik.handleSubmit();
      return;
    }

    const { valid, error } = validateBreakoutRoomAssignment();
    if (valid) {
      formik.handleSubmit();
    } else {
      setError(error);
    }
  };

  const { setFieldValue } = formik;

  useEffect(() => {
    setFieldValue('maxParticipantsPerRoom', maxParticipantsPerRoom);
    setFieldValue('maxRooms', maxRooms);
  }, [maxParticipantsPerRoom, maxRooms, setFieldValue]);

  return (
    <Form onSubmit={formik.handleSubmit} sx={{ overflow: 'auto' }}>
      <Box sx={{ marginBottom: 2 }}>
        <Stack
          spacing={2}
          direction="column"
          sx={{
            justifyContent: 'flex-start',
          }}
        >
          <DurationFieldWrapper>
            <DurationField
              {...formikDurationFieldProps('duration', formik, 0)}
              ButtonProps={{
                size: 'small',
              }}
              min={0}
            />
          </DurationFieldWrapper>
          <CommonFormItem
            {...formikProps('selectionMode', formik)}
            label={t('breakout-room-form-field-based-on')}
            control={
              <Select labelId={`${ariaId}-selectionMode`} name="selectionMode">
                <MenuItem value={DropdownOptions.Rooms}>{t('global-rooms')}</MenuItem>
                <MenuItem value={DropdownOptions.Participants}>{t('global-participants')}</MenuItem>
              </Select>
            }
          />
          {formik.values.selectionMode === DropdownOptions.Participants ? (
            <CommonFormItem
              {...formikProps('participantsPerRoom', formik)}
              label={t('breakout-room-form-field-participants-per-room')}
              control={
                <NumberInput
                  type="number"
                  slotProps={{ htmlInput: { min: 2, max: formik.values.maxParticipantsPerRoom } }}
                />
              }
            />
          ) : (
            <CommonFormItem
              {...formikProps('rooms', formik)}
              label={t('breakout-room-form-field-rooms')}
              control={<NumberInput type="number" slotProps={{ htmlInput: { min: 1, max: formik.values.maxRooms } }} />}
            />
          )}
          <CommonFormItem
            {...formikSwitchProps('distribution', formik)}
            control={<Switch color="primary" />}
            label={t('breakout-room-form-field-random-distribution')}
          />
          <TextWithDivider variant="caption" id={ariaId}>
            {roomCreationInfoText}
          </TextWithDivider>
        </Stack>
        {typeof formik.errors.selectionMode === 'string' && (
          <ErrorFormMessage helperText={t(formik.errors.selectionMode)} />
        )}
      </Box>
      {!formik.values.distribution && (
        <Box sx={{ marginBottom: 2 }}>
          <ParticipantsSelector
            onChange={(value) => formik.setFieldValue('assignments', value)}
            assignments={formik.values.assignments}
            selectionMode={formik.values.selectionMode}
            rooms={formik.values.rooms}
            participantsPerRoom={formik.values.participantsPerRoom}
          />
        </Box>
      )}
      <Button onClick={customSubmit} disabled={formik.isSubmitting} color="secondary">
        {t('breakout-room-start-button')}
      </Button>
      {error && (
        <Box>
          <ErrorFormMessage helperText={error} />
        </Box>
      )}
    </Form>
  );
};

export default CreateRoomsForm;
