// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ExcalidrawScene } from '../api/types/incoming/whiteboard';
import { EditRestrictions } from '../api/types/outgoing/whiteboard';

type SpacedeckMessage = {
  status: 'initialized';
  url: string;
};

export type WhiteboardState = {
  editRestrictions: EditRestrictions;
  scene: ExcalidrawScene;
} & SpacedeckMessage;
