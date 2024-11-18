// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ErrorStruct } from '../types';

// ignore the rule, as it's not relevant for HMR
// eslint-disable-next-line react-refresh/only-export-components
declare const UnitSymbol: unique symbol;
export type Unit<S> = number & { [UnitSymbol]: S };

// ignore the rule, as it's not relevant for HMR
// eslint-disable-next-line react-refresh/only-export-components
declare const MilliSecondsSymbol: unique symbol;
export type MilliSeconds = Unit<typeof MilliSecondsSymbol>;

// ignore the rule, as it's not relevant for HMR
// eslint-disable-next-line react-refresh/only-export-components
declare const SecondsSymbol: unique symbol;
export type Seconds = Unit<typeof SecondsSymbol>;

export const isStringEnum =
  <T extends Record<string, unknown>>(e: T) =>
  (token: T[keyof T] | unknown): token is T[keyof T] =>
    Object.values(e).includes(token as T[keyof T]);

export const isErrorStruct = (msg: ErrorStruct<string>): msg is ErrorStruct<string> => {
  return msg.error !== undefined && typeof msg.error === 'string';
};

export const isEnumErrorStruct =
  <T extends Record<string, unknown>, E extends string = Extract<keyof T, string>>(e: T) =>
  (msg: ErrorStruct<E> | Record<string, unknown>): msg is ErrorStruct<E> => {
    return msg.error !== undefined && isStringEnum(e)(msg.error);
  };
