// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { DurationField } from '../../../commonComponents';
import { DurationFieldWrapper } from '../../DurationFieldWrapper';

type DurationRowProps = {
  value: number | null;
  changeValue: (value: number | null) => void;
  handleChangeEvent: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function DurationRow({ value, changeValue, handleChangeEvent }: DurationRowProps) {
  return (
    <DurationFieldWrapper>
      <DurationField
        name="duration"
        value={value}
        onChange={handleChangeEvent}
        setFieldValue={(_field, value) => changeValue(Number(value))}
        ButtonProps={{
          size: 'small',
        }}
        min={0}
      />
    </DurationFieldWrapper>
  );
}
