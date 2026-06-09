// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ParticipantId } from '../../../../types';
import { RoomIndex } from './form';

export type Assignments = Record<RoomIndex, ReadonlyArray<ParticipantId>>;
