// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { MODERATION_MENU_VIEW, ModerationTabKey } from '../config/constants';
import { SidePanelView } from '../types/sidepanel';

export const isModerationView = (view: SidePanelView | null) =>
  view === MODERATION_MENU_VIEW || Object.values(ModerationTabKey).includes(view as ModerationTabKey);
