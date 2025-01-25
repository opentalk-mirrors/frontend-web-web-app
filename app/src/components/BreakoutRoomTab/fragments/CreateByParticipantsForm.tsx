// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, Stack, styled, Switch } from '@mui/material';
import { useFormikContext } from 'formik';
import { get } from 'lodash';
import { useTranslation } from 'react-i18next';

import { CommonFormItem, DurationField, CommonTextField } from '../../../commonComponents';
import { useAppSelector } from '../../../hooks';
import { selectParticipantsTotal } from '../../../store/slices/participantsSlice';
import { formikDurationFieldProps, formikProps, formikSwitchProps } from '../../../utils/formikUtils';
import { generateUniqueId } from '../../../utils/stringUtils';
import { DurationFieldWrapper } from '../../DurationFieldWrapper';
import TextWithDivider from '../../TextWithDivider';

const CreateButton = styled(Button)({
  alignSelf: 'flex-start',
});

const NumberInput = styled(CommonTextField)(({ theme }) => ({
  maxWidth: '4rem',
  '& input': {
    paddingRight: theme.spacing(0),
    textAlign: 'center',
  },
}));

interface ICreateByParticipantsFormProps {
  handleNext: () => void;
  formName?: string;
}

const CreateByParticipantsForm = ({ handleNext, formName }: ICreateByParticipantsFormProps) => {
  const { t } = useTranslation();
  const participantsTotal = useAppSelector(selectParticipantsTotal);
  const { ...formik } = useFormikContext();

  const getFormName = (name: string) => (formName ? `${formName}.${name}` : name);
  const participantsPerRoom = get(formik.values, getFormName('participantsPerRoom'));
  const rooms = Math.max(2, Math.floor(participantsTotal / participantsPerRoom));
  const maxParticipantsPerRoom = Math.max(2, Math.floor(participantsTotal / 2));

  const ariaId = generateUniqueId();

  return (
    <Stack
      spacing={2}
      direction="column"
      sx={{
        justifyContent: 'flex-start',
      }}
    >
      <DurationFieldWrapper>
        <DurationField
          {...formikDurationFieldProps(getFormName('duration'), formik, 0)}
          ButtonProps={{
            size: 'small',
          }}
          min={0}
        />
      </DurationFieldWrapper>
      <CommonFormItem
        {...formikProps(getFormName('participantsPerRoom'), formik)}
        label={t('breakout-room-form-field-participants-per-room')}
        control={<NumberInput type="number" inputProps={{ min: 2, max: maxParticipantsPerRoom }} />}
      />
      <CommonFormItem
        {...formikSwitchProps(getFormName('distribution'), formik)}
        control={<Switch color="primary" />}
        label={t('breakout-room-form-field-random-distribution')}
      />
      <CommonFormItem
        {...formikSwitchProps(getFormName('includeModerators'), formik)}
        control={<Switch color="primary" />}
        label={t('breakout-room-form-field-include-moderators')}
      />
      <TextWithDivider variant="caption" id={ariaId}>
        {t('breakout-room-rooms-created-by-participants', { rooms })}
      </TextWithDivider>
      <CreateButton size="small" onClick={handleNext} aria-describedby={ariaId}>
        {t('breakout-room-create-button')}
      </CreateButton>
    </Stack>
  );
};

export default CreateByParticipantsForm;
