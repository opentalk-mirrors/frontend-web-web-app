// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Typography, TypographyProps } from '@mui/material';
import { FC, PropsWithChildren } from 'react';

import { LEGEND_TITLE_ID } from './constants';

type LegendTitleProps = PropsWithChildren<Omit<TypographyProps, 'id'>>;

export const LegendTitle: FC<LegendTitleProps> = (props) => {
  return <Typography {...props} id={LEGEND_TITLE_ID} />;
};
