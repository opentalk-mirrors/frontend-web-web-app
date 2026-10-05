// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { MenuTab } from '../components/MenuTabs/fragments/constants';
import type { ModerationTabKey } from '../config/constants';
import { MODERATION_MENU_VIEW } from '../config/constants';

export type SidePanelView = MenuTab | ModerationTabKey | typeof MODERATION_MENU_VIEW;
