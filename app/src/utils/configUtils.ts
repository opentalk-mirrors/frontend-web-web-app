// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import log from '../logger';

export const checkConfigError = () => {
  const config = window.config;

  if (config === undefined) {
    log.error('Missing config');
    return true;
  }

  if (config.insecure === undefined) {
    log.error('Missing insecure flag');
    return true;
  }
  if (typeof config.insecure !== 'boolean') {
    log.error('Invalid insecure flag');
    return true;
  }

  if (config.baseUrl === undefined) {
    log.error('Missing base url');
    return true;
  }

  try {
    new URL(config.baseUrl);
  } catch (error) {
    log.error('Invalid base url -', error);
    return true;
  }

  if (config.controller === undefined) {
    log.error('Missing controller url');
    return true;
  }

  if (config.oidcConfig === undefined) {
    log.error('Missing oidc config');
    return true;
  }

  if (config.oidcConfig.authority === undefined) {
    log.error('Missing authority url');
    return true;
  }

  try {
    new URL(config.oidcConfig.authority);
  } catch (error) {
    log.error('Invalid authority url -', error);
    return true;
  }

  return false;
};
