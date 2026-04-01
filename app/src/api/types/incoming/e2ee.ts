// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { NamespacedIncoming } from '../../../types';

export type Message = object;

export type E2ee = NamespacedIncoming<Message, 'e2ee'>;

export default E2ee;
