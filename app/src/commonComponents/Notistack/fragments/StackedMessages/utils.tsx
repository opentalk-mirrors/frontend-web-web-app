// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import StackedMessages from './StackedMessages';

export const createStackedMessages = (messages: string[]) => {
  return <StackedMessages messages={messages} />;
};
