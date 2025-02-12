// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { CloseIcon } from '../../../../assets/icons';

type CloseButtonProps = {
  onClick?: () => void;
  className?: string;
};

export const CloseButton = (props: CloseButtonProps) => {
  const { t } = useTranslation();

  return (
    <IconButton
      aria-label={t('global-close')}
      data-testid="close-button"
      onClick={props.onClick}
      className={props.className}
    >
      <CloseIcon />
    </IconButton>
  );
};
