// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
type ChannelName = 'settings_general';

const channels: Map<ChannelName, BroadcastChannel> = new Map();

export function getBroadcastChannel(name: ChannelName): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') {
    console.warn('BroadcastChannel is not supported in this environment.');
    return null;
  }

  if (!channels.has(name)) {
    const channel = new BroadcastChannel(name);
    channels.set(name, channel);
  }

  return channels.get(name) || null;
}

export function closeBroadcastChannel(name: ChannelName): void {
  const channel = channels.get(name);
  if (channel) {
    channel.close();
    channels.delete(name);
  }
}
