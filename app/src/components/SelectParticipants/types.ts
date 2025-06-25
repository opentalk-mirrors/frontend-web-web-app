// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { SxProps, Theme } from '@mui/material';

export type HTMLLIElementWithSxProps = React.HTMLAttributes<HTMLLIElement> & {
  sx?: SxProps<Theme>;
};
