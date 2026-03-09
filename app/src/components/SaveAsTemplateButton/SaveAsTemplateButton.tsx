// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, ButtonProps, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { SharedFolderIcon } from '../../assets/icons';

const StyledSaveTemplateButton = styled(Button)(({ theme }) => ({
  alignSelf: 'flex-start',
  paddingLeft: 0,
  '&.Mui-disabled': {
    color: theme.palette.text.disabled,
  },
}));

const SaveAsTemplateIcon = styled(SharedFolderIcon)({
  width: '1em',
  height: '1em',
});

const SaveAsTemplateButton = ({ onClick, disabled }: Pick<ButtonProps, 'disabled' | 'onClick'>) => {
  const { t } = useTranslation();

  return (
    <StyledSaveTemplateButton
      size="small"
      type="button"
      variant="text"
      onClick={onClick}
      startIcon={<SaveAsTemplateIcon />}
      color="secondary"
      disabled={disabled}
    >
      {t('save-as-template-button')}
    </StyledSaveTemplateButton>
  );
};

export default SaveAsTemplateButton;
