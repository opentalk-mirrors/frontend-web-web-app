// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Namespaces } from '@opentalk/rest-api-rtk-query';
import { PayloadActionCreator } from '@reduxjs/toolkit';

import { IfVoid, IsAny, IsEmptyObj, IsUnknownOrNonInferrable, Namespaced } from '../../types';

export interface Action {
  action: string;
}

interface BasePrepareMessage<P, OP, N extends string = Namespaces> {
  (payload: OP): Namespaced<P, N>;
  action: PayloadActionCreator<OP>;
}

export interface PrepareMessageWithPayload<P, OP, N extends string = Namespaces> extends BasePrepareMessage<P, OP, N> {
  /**
   * Calling this {@link redux#ActionCreator} with an argument will
   * return a {@link PayloadAction} of type `T` with a payload of `P`
   */
  (payload: OP): Namespaced<P, N>;
  action: PayloadActionCreator<OP>;
}

export interface PrepareMessageWithoutPayload<P, N extends string = Namespaces> extends BasePrepareMessage<P, void, N> {
  /**
   * Calling this {@link redux#ActionCreator} with an argument will
   * return a {@link PayloadAction} of type `T` with a payload of `P`
   */
  (): Namespaced<P, N>;
  action: PayloadActionCreator;
}

export interface PrepareMessageWithNonInferrablePayload<N extends string = Namespaces> extends BasePrepareMessage<
  unknown,
  unknown,
  N
> {
  /**
   * Calling this {@link redux#ActionCreator} with an argument will
   * return a {@link PayloadAction} of type `T` with a payload
   * of exactly the type of the argument.
   */
  <PT>(payload: PT): Namespaced<PT, N>;
}

/*
 * @typeParam P the `Action` type
 * @typeParam OP the action payload, normally Omit<Action, 'action'>
 * @typeParam N the namespace
 *
 * @public
 */
export type PrepareMessageCreator<P = void, OP = void, N extends string = Namespaces> = IsAny<
  P,
  PrepareMessageWithPayload<P, P, N>,
  // else
  IsUnknownOrNonInferrable<
    P,
    PrepareMessageWithNonInferrablePayload<N>,
    // else
    IfVoid<
      P,
      PrepareMessageWithoutPayload<P, N>,
      // else
      IsEmptyObj<OP, PrepareMessageWithoutPayload<P, N>, PrepareMessageWithPayload<P, OP, N>>
    >
  >
>;
