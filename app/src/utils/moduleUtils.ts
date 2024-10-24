// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { BackendFeatures, Modules } from '@opentalk/rest-api-rtk-query';

export const isFeatureEnabledPredicate = (featureKey: BackendFeatures, modules: Modules) => {
  return Object.values(modules).some((module) => module.features.includes(featureKey));
};
