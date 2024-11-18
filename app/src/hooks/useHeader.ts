// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useOutletContext } from 'react-router-dom';

type DashboardTemplateContext = {
  header: React.ReactNode;
  setHeader: (header: React.ReactNode) => void;
};

export const useHeader = () => {
  return useOutletContext<DashboardTemplateContext>();
};
