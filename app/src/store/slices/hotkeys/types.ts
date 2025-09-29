// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { AppDispatch, RootState } from '../../../store';

export type ModifierKey = 'Control' | 'Shift' | 'Alt' | 'Meta';

export interface HotkeyCallbackParams {
  state: RootState;
  dispatch: AppDispatch;
  preventActiveMediaAfterPermissionPrompt?: boolean;
}

export interface Hotkey {
  key: string;
  modifier?: ModifierKey;
  onPress: (params: HotkeyCallbackParams) => void;
  onRelease?: (params: HotkeyCallbackParams) => void;
  descriptionKey: string;
  preventActiveMediaAfterPermissionPrompt?: boolean;
  //force prevent from default action for this hotkey
  forcePreventDefault?: boolean;
}
