// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { selectOnlineConnectionsTotal } from '../store/slices/participantsSlice';
import { useAppSelector } from './useCustomRedux';
import { useGridPageSize } from './useGridPageSize';

// Number of grid pages for the current page size. Counts connections rather than participants
export function useGridPageCount() {
  const connectionsTotal = useAppSelector(selectOnlineConnectionsTotal);
  const gridPageSize = useGridPageSize();

  return Math.ceil(connectionsTotal / gridPageSize);
}
