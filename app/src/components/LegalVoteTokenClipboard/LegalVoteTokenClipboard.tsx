// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Button, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { CopyIcon } from '../../assets/icons';
import { CommonTextField, notifications } from '../../commonComponents';
import { useDateFormat } from '../../hooks';
import log from '../../logger';

interface LegalVoteTokenClipboardProps {
  name: string;
  timestamp: string;
  vote: string;
  token: string;
}

const Container = styled(Box)(() => ({
  width: '100%',
}));

export function LegalVoteTokenClipboard(props: LegalVoteTokenClipboardProps) {
  const { t } = useTranslation();
  const date = useDateFormat(new Date(props.timestamp), `date`);
  const time = useDateFormat(new Date(props.timestamp), `time`);

  function injectTokenIntoClipboard() {
    const content = `
${props.name}
${date}
${time}
${t('legal-vote-success-clipboard-message', { vote: props.vote })}
${props.token}
        `.trim();
    navigator.clipboard
      .writeText(content)
      .then(() => {
        notifications.success(t('legal-vote-token-copy-success'));
      })
      .catch((error) => {
        log.error(error);
      });
  }

  return (
    <Container display="flex" alignItems="center" gap={2}>
      <CommonTextField name="token" value={props.token} fullWidth slotProps={{ input: { readOnly: true } }} />
      <Button type="button" onClick={injectTokenIntoClipboard} aria-label="Copy token">
        <CopyIcon />
      </Button>
    </Container>
  );
}
