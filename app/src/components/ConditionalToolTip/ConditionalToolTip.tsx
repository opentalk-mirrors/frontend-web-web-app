// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Tooltip } from '@mui/material';
import { ReactElement } from 'react';

interface ConditionalToolTipProps {
  showToolTip: boolean;
  title?: string;
  children: ReactElement<JSX.Element, string>;
}
export const ConditionalToolTip: React.FC<ConditionalToolTipProps> = ({
  showToolTip,
  title,
  children,
}: ConditionalToolTipProps) => {
  if (showToolTip && title) {
    return (
      <Tooltip placement="top" title={title}>
        {children}
      </Tooltip>
    );
  }

  return children;
};
