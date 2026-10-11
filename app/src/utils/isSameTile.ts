// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { TileIdentifier } from '../types';

export const isSameTile = (a: TileIdentifier | undefined, b: TileIdentifier | undefined): boolean =>
  a !== undefined && b !== undefined && a.connectionIdentifier === b.connectionIdentifier && a.source === b.source;
