// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { VariantType } from 'notistack';

import BinaryActionNotification from './BinaryActionNotification';
import ConsentNotification, { showConsentNotification } from './ConsentNotification';
import { CustomNotification } from './CustomNotification';
import { TalkingStickMutedNotification } from './TalkingStickMutedNotification';
import { TalkingStickUnmutedNotification } from './TalkingStickUnmutedNotification';
import TimeLimitNotification, { startTimeLimitNotification, stopTimeLimitNotification } from './TimeLimitNotification';

export { startTimeLimitNotification, stopTimeLimitNotification, showConsentNotification };
interface NotistackCustomComponents {
  binaryAction: typeof BinaryActionNotification;
  timeLimit: typeof TimeLimitNotification;
  consent: typeof ConsentNotification;
  talkingStickMuted: typeof TalkingStickMutedNotification;
  talkingStickUnmuted: typeof TalkingStickUnmutedNotification;
  success: typeof CustomNotification;
  error: typeof CustomNotification;
  warning: typeof CustomNotification;
  info: typeof CustomNotification;
}

type ComponentsParameter = {
  [variant in VariantType]?: React.JSXElementConstructor<unknown>;
};

export function getNotistackComponents(components: ComponentsParameter = {}): NotistackCustomComponents {
  return {
    ...components,
    binaryAction: BinaryActionNotification,
    timeLimit: TimeLimitNotification,
    consent: ConsentNotification,
    talkingStickMuted: TalkingStickMutedNotification,
    talkingStickUnmuted: TalkingStickUnmutedNotification,
    success: CustomNotification,
    error: CustomNotification,
    warning: CustomNotification,
    info: CustomNotification,
  };
}
