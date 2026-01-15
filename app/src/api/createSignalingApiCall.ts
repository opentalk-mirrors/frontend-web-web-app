// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Namespaces } from '@opentalk/rest-api-rtk-query';
import { createAction } from '@reduxjs/toolkit';
import { DistributiveOmit } from 'react-redux';

import { Property } from '../tsHelper';
import { Action, PrepareMessageCreator } from './types/signaling';

export function createSignalingApiCall<
  P extends Action,
  N extends string = Namespaces,
  A extends string = Property<P, 'action'>,
>(namespace: N, actionType: A): PrepareMessageCreator<P, DistributiveOmit<P, 'action'>, N>;

export function createSignalingApiCall<P extends Action>(namespace: Namespaces, actionType: string) {
  // Redux action used by the reducer
  const action = createAction(`signaling/${namespace}/${actionType}`);

  // Called by the middleware
  const prepareMessage = (arg: DistributiveOmit<P, 'action'>) => {
    return {
      namespace: namespace,
      payload:
        arg === undefined
          ? {
              action: actionType,
            }
          : {
              ...arg,
              action: actionType,
            },
    };
  };

  prepareMessage.action = action;
  return prepareMessage;
}
