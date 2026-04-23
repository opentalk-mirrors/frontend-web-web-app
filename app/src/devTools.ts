// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { LogLevel, LoggerNames, loggers, setLogLevel, transformLevel } from './logger';
import { setForceNewDeviceSecret } from './modules/WebRTC/ConferenceRoom';

export const exposeDevTools = () => {
  window.setLogLevel = (level: LogLevel, name?: LoggerNames) => {
    const lowercaseName = name?.toLowerCase();
    if (lowercaseName && !loggers[lowercaseName]) {
      console.warn(`Invalid logger name: ${lowercaseName}`);
      return;
    }
    setLogLevel(level, lowercaseName);
    console.log(`Log level for ${lowercaseName || 'all'} set to ${transformLevel(level)}`);
  };

  window.setForceNewDeviceSecret = (enabled: boolean) => {
    setForceNewDeviceSecret(enabled);
    console.log(`Force new device secret ${enabled ? 'enabled' : 'disabled'}`);
  };
};
