// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
// API endpoint for configuration settings
import { BaseQueryFn, FetchArgs, FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/query';

import { Tags } from '../types/common';
import { BasePalette } from '../types/config';
import { EndpointBuilder } from './helper';

export const defaultLightModeColors: BasePalette = {
  primary: '#20434F',
  secondary: '#D1E545',
  background: '#f1f3f4',
  error: '#ff7f74',
  danger: '#ff6e65',
  success: '#66d669',
  warning: '#fe9b34',
  info: '#66b5ff',
  textPrimary: '#20434F',
  textSecondary: '#D1E545',
  textError: '#a42424',
};
export const defaultDarkModeColors: BasePalette = {
  primary: '#dfe2e2',
  secondary: '#D1E545',
  background: '#20434F',
  error: '#db3836',
  danger: '#a42424',
  success: '#36943b',
  warning: '#b56701',
  info: '#0080dc',
  textPrimary: '#FFFFFF',
  textSecondary: '#D1E545',
  textError: '#ff7f74',
};

export const addConfigurationEndpoints = <
  ConfigurationEndpointBuilder extends EndpointBuilder<
    BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError, Record<string, unknown>, FetchBaseQueryMeta>,
    Tags,
    'api'
  >,
>(
  builder: ConfigurationEndpointBuilder
) => ({
  getColorSchemes: builder.query({
    async queryFn() {
      // Simulate a delay for fetching color schemes
      await new Promise((resolve) => setTimeout(resolve, 0));
      return {
        data: {
          baseColorScheme: {
            light: defaultLightModeColors,
            dark: defaultDarkModeColors,
          },
        },
      };
    },
  }),
});
