// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { createAction } from '@reduxjs/toolkit';

export const domKeyDown = createAction<KeyboardEvent>('hotkeys/domKeyDown');
export const domKeyUp = createAction<KeyboardEvent>('hotkeys/domKeyUp');
export const domFocusIn = createAction<FocusEvent>('hotkeys/domFocusIn');
export const domFocusOut = createAction<FocusEvent>('hotkeys/domFocusOut');
