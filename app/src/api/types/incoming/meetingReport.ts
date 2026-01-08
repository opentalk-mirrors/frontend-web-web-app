// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { AssetId } from '@opentalk/rest-api-rtk-query';

import { ErrorStruct, NamespacedIncoming } from '../../../types';

interface PdfAsset {
  message: 'pdf_asset';
  filename: string;
  assetId: AssetId;
}

export enum MeetingReportError {
  InsufficientPermissions = 'insufficient_permissions',
  StorageExceeded = 'storage_exceeded',
  GenerateFailed = 'generate_failed',
}

export type Message = PdfAsset | ErrorStruct<MeetingReportError>;
export type MeetingReport = NamespacedIncoming<Message, 'meeting_report'>;

export default MeetingReport;
