// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { NamespacedIncoming } from '../../../types';

type InvalidJSON = {
  error: 'invalid_json';
  message: string;
};

type Internal = {
  error: 'internal';
};

type UnknownNamespace = {
  error: 'unknown_namespace';
  invalid_namespace: string;
};

type FatalModuleError = {
  error: 'fatal_module_error';
  namespace: string;
};

type NotSupported = {
  error: 'not_supported';
};

export type Message = InvalidJSON | Internal | UnknownNamespace | FatalModuleError | NotSupported;

export type RoomServerErrorMessage = NamespacedIncoming<Message, 'error'>;

export default RoomServerErrorMessage;
