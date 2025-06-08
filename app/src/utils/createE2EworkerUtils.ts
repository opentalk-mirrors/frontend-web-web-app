// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2

export const createE2Eworker = (e2eePassphrase: string, e2eEncryption?: boolean) => {
  let worker = null;

  if (e2eEncryption && !worker && e2eePassphrase) {
    const newWorker = new Worker(new URL('livekit-client/e2ee-worker', import.meta.url));
    worker = newWorker;
  }

  return worker;
};
