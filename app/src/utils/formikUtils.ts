// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { FormikProps } from 'formik';
import { get } from 'lodash';
import * as React from 'react';

type Primitive = string | number | null | undefined;
interface IFormikCommonPropsReturnValue {
  name: string;
  onChange: {
    (e: React.ChangeEvent<HTMLInputElement>): void;
    <T_1 = string | React.ChangeEvent<HTMLInputElement>>(
      field: T_1
    ): T_1 extends React.ChangeEvent<HTMLInputElement>
      ? void
      : (e: string | React.ChangeEvent<HTMLInputElement>) => void;
  };
  onBlur: {
    (e: React.FocusEvent<HTMLInputElement>): void;
    <T = HTMLInputElement>(fieldOrEvent: T): T extends string ? (e: HTMLInputElement) => void : void;
  };
  error?: boolean;
  helperText?: string;
}

interface IFormikPropsReturnValue extends IFormikCommonPropsReturnValue {
  value: string | undefined;
}

/*
 * A utility type, which extracts the keys of a Formik form values object
 * and creates a string literal type that represents the paths to those keys.
 * Used for a type-safe access to nested properties in Formik's values.
 * For example, if the form values object has the following structure:
 * {
 *   user: {
 *     name: string;
 *     age: number;
 *   };
 * }
 * The type would produce the following string literal type:
 * "user.name" | "user.age"
 */

type FormikPaths<T> = T extends object
  ? { [K in keyof T]: `${Exclude<K, symbol>}${'' | `.${FormikPaths<T[K]>}`}` }[keyof T]
  : never;

export interface IFormikSwitchPropsReturnValue extends IFormikCommonPropsReturnValue {
  checked: boolean;
  onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
}

export interface IFormikDateTimePickerPropsReturnValue extends IFormikCommonPropsReturnValue {
  value: string | number;
  setFieldValue: (field: string, value: Primitive, shouldValidate?: boolean) => void;
}

export interface IFormikCustomFieldPropsReturnDurationValue extends IFormikCommonPropsReturnValue {
  value: number | null;
  setFieldValue: (field: string, value: Primitive, shouldValidate?: boolean) => void;
}

export interface IFormikRatingPropsReturnValue extends IFormikCommonPropsReturnValue {
  value: number | null | undefined;
}

export function formikMinimalProps<Values>(
  fieldName: FormikPaths<Values>,
  formik: FormikProps<Values>
): IFormikPropsReturnValue {
  const { values, handleBlur, handleChange } = formik;

  const getValue = () => {
    const raw = get(values, fieldName);
    if (typeof raw === 'string') {
      return raw;
    }
    if (typeof raw === 'number') {
      return String(raw);
    }
    return '';
  };

  return {
    name: fieldName,
    onChange: handleChange,
    onBlur: handleBlur,
    value: getValue(),
  };
}

export function formikProps<Values>(
  fieldName: FormikPaths<Values>,
  formik: FormikProps<Values>
): IFormikPropsReturnValue {
  const { values, handleBlur, handleChange, errors } = formik;
  const errorMessage = get(errors, fieldName);
  const hasError = Boolean(errorMessage);

  const getValue = () => {
    const raw = get(values, fieldName);
    if (typeof raw === 'string') {
      return raw;
    }
    if (typeof raw === 'number') {
      return String(raw);
    }
    return '';
  };

  return {
    name: fieldName,
    onChange: handleChange,
    onBlur: handleBlur,
    value: getValue(),
    error: hasError,
    helperText: (hasError && (errorMessage as string)) || undefined,
  };
}

export function formikSwitchProps<Values>(
  fieldName: FormikPaths<Values>,
  formik: FormikProps<Values>
): IFormikSwitchPropsReturnValue {
  const { values, handleBlur, handleChange, errors } = formik;

  const errorMessage = get(errors, fieldName);
  const hasError = Boolean(errorMessage);

  const isChecked = () => get(values, fieldName) === true;

  return {
    name: fieldName,
    onChange: handleChange,
    onKeyDown: (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        formik.setFieldValue(fieldName, !isChecked());
      }
    },
    onBlur: handleBlur,
    checked: isChecked(),
    error: hasError,
    helperText: (hasError && (errorMessage as string)) || undefined,
  };
}

export function formikDateTimePickerProps<Values>(
  fieldName: FormikPaths<Values>,
  formik: FormikProps<Values>
): IFormikDateTimePickerPropsReturnValue {
  const { values, handleBlur, handleChange, errors, setFieldValue } = formik;

  const errorMessage = get(errors, fieldName);
  const hasError = Boolean(errorMessage);

  const rawValue = get(values, fieldName);
  const value: string | number = typeof rawValue === 'number' || typeof rawValue === 'string' ? rawValue : '';

  return {
    name: fieldName,
    value,
    onChange: handleChange,
    onBlur: handleBlur,
    error: hasError,
    helperText: (hasError && (errorMessage as string)) || undefined,
    setFieldValue,
  };
}

export function formikRatingProps<Values>(
  fieldName: FormikPaths<Values>,
  formik: FormikProps<Values>
): IFormikRatingPropsReturnValue {
  const { values, handleBlur, handleChange, errors } = formik;

  const errorMessage = get(errors, fieldName);
  const hasError = Boolean(errorMessage);

  const getValue = () => {
    const raw = get(values, fieldName);
    if (typeof raw === 'number') {
      return raw;
    }
    if (typeof raw === 'string') {
      return parseInt(raw, 10);
    }
    return 0;
  };

  return {
    name: fieldName,
    onChange: handleChange,
    onBlur: handleBlur,
    error: hasError,
    value: getValue(),
    helperText: (hasError && (errorMessage as string)) || undefined,
  };
}

export function formikGetValue<Values>(fieldName: FormikPaths<Values>, formik: FormikProps<Values>, defaultValue = '') {
  const { values } = formik;
  return get(values, fieldName, defaultValue);
}

export function formikDurationFieldProps<Values>(
  fieldName: FormikPaths<Values>,
  formik: FormikProps<Values>,
  /**
   * Duration value in minutes
   *
   * Default: 1
   */
  defaultValue?: number
): IFormikCustomFieldPropsReturnDurationValue {
  const { setFieldValue, values, handleBlur, handleChange, errors } = formik;

  const errorMessage = get(errors, fieldName);
  const hasError = Boolean(errorMessage);

  return {
    name: fieldName,
    setFieldValue: setFieldValue,
    onChange: handleChange,
    onBlur: handleBlur,
    error: hasError,
    value: get(values, fieldName, defaultValue ?? 1) as number,
    helperText: (hasError && (errorMessage as string)) || undefined,
  };
}

export function formikNumberFieldProps<Values>(
  fieldName: FormikPaths<Values>,
  formik: FormikProps<Values>,
  /**
   * Duration value in minutes
   *
   * Default: 1
   */
  defaultValue?: number
) {
  const { values, handleBlur, handleChange } = formik;

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = parseInt(event.target.value);
    if (Number.isNaN(nextValue)) {
      handleChange({ ...event, target: { ...event.target, value: defaultValue } });
      return;
    }

    handleChange(event);
  };

  return {
    name: fieldName,
    onChange: onChange,
    onBlur: handleBlur,
    value: get(values, fieldName, defaultValue ?? 1)?.toString(),
  };
}
