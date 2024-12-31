// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from '../../hooks';
import { selectWhiteboardUrl } from '../../store/slices/whiteboardSlice';

const WhiteboardIframe = styled('iframe')({
  height: '100%',
  width: '100%',
  display: 'block',
  border: 0,
});

const WhiteboardView = () => {
  const { t } = useTranslation();
  const whiteboardUrl = useAppSelector(selectWhiteboardUrl);

  return (
    <WhiteboardIframe
      src={whiteboardUrl}
      title={t('moderationbar-button-whiteboard-tooltip')}
      aria-label={t('moderationbar-button-whiteboard-tooltip')}
    />
  );
};

export default WhiteboardView;
