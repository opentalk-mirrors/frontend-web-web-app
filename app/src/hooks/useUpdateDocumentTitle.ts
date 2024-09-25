// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useEffect } from 'react';

type HookOptions = {
  extension?: string;
};

export function useUpdateDocumentTitle(title: string, options: HookOptions = { extension: ' in OpenTalk' }) {
  useEffect(() => {
    document.title = title + options.extension;
  }, [title]);
}
