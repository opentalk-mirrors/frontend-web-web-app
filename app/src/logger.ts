// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { setLogLevel as setLiveKitLogLevel } from 'livekit-client';
import log, { LogLevelDesc } from 'loglevel';

import store from './store';
import { selectLogLevel } from './store/slices/configSlice';

enum LogLevel {
  trace = 0,
  debug = 1,
  info = 2,
  warn = 3,
  error = 4,
  silent = 5,
}

enum LoggerNames {
  OpenTalk = 'opentalk',
  Livekit = 'livekit',
}

const loggers: Record<string, log.Logger> = {};

Object.values(LoggerNames).forEach((name) => {
  const logger = log.getLogger(name);
  loggers[name] = logger;
});

/**
 * Configure initial log levels based on config
 * e.g. "info,livekit=debug".
 */
function configureLogLevels() {
  const envLogLevel = selectLogLevel(store.getState()) || 'info';

  // Parse LOG_LEVEL format (e.g., "info,livekit=debug")
  const moduleLevels = envLogLevel.split(',').map((entry) => entry.trim());

  moduleLevels.forEach((levelEntry) => {
    const [module, level] = levelEntry.includes('=')
      ? levelEntry.split('=').map((s) => s.trim())
      : ['opentalk', levelEntry];

    if (isValidLogLevel(level)) {
      if (module === 'opentalk') {
        log.setLevel(level);
        loggers[LoggerNames.OpenTalk].setLevel(level as LogLevelDesc);
      } else if (loggers[module]) {
        loggers[module].setLevel(level);
        if (module === LoggerNames.Livekit) {
          setLiveKitLogging(level);
        }
      }

      synchronizeLogLevelsToLocalStorage();
    } else {
      console.warn(`Invalid log level: ${level}`);
    }
  });
}

function setLogLevel(level: LogLevelDesc, name?: string) {
  if (name) {
    if (loggers[name]) {
      loggers[name].setLevel(level);
      if (name === LoggerNames.Livekit) {
        setLiveKitLogging(level);
      }
    } else {
      console.warn(`Logger for ${name} does not exist`);
    }
  } else {
    Object.values(loggers).forEach((logger) => logger.setLevel(level as LogLevelDesc));
    setLiveKitLogging(level);
  }
  synchronizeLogLevelsToLocalStorage();
}

function setLiveKitLogging(level: LogLevelDesc) {
  const liveKitLogLevel = LogLevel[level as keyof typeof LogLevel];
  setLiveKitLogLevel(liveKitLogLevel);
}

function transformLevel(level: string | number): string {
  if (typeof level === 'number') {
    return LogLevel[level]?.toLowerCase() ?? 'unknown';
  }

  if (typeof level === 'string' && Object.keys(LogLevel).includes(level.toLowerCase())) {
    return level.toLowerCase();
  }

  return 'unknown';
}

function isValidLogLevel(level: string | number): level is LogLevelDesc {
  return transformLevel(level) !== 'unknown';
}

function synchronizeLogLevelsToLocalStorage() {
  const currentLevels = Object.entries(loggers)
    .map(([key, logger]) => `${key}=${logger.getLevel()}`)
    .join(',');
  localStorage.setItem('loglevel', currentLevels);
}

// Expose setting log levels in the browser console
export const exposeSetLogLevel = () => {
  window.setLogLevel = (level: LogLevel, name?: LoggerNames) => {
    const lowercaseName = name?.toLowerCase();
    if (lowercaseName && !loggers[lowercaseName]) {
      console.warn(`Invalid logger name: ${lowercaseName}`);
      return;
    }
    setLogLevel(level, lowercaseName);
    console.log(`Log level for ${lowercaseName || 'all'} set to ${transformLevel(level)}`);
  };
};

configureLogLevels();
