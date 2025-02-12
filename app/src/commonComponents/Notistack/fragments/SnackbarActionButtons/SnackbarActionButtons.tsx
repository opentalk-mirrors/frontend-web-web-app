// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Button, styled } from '@mui/material';

import { CloseButton } from '../CloseButton';
import { ISnackbarActionButtonProps } from '../utils';

// a hack to fix for https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1323#note_111313
// theoretically, those colors should come from the notistack itself for the `inherit` button color
// but for some reason they are being overwritten by our dark palette, so we have to explicitily set the colors here...
const CustomButton = styled(Button)(() => ({
  backgroundColor: '#e0e0e0',
  color: '#20434F',
  ':hover': {
    backgroundColor: '#FFF',
  },
}));

const StyledCloseButton = styled(CloseButton)(({ theme }) => ({
  padding: theme.spacing(1),
}));

const SnackbarActionButtons = ({
  onCancel,
  onAction,
  actionBtnText,
  cancelBtnText,
  hideCloseButton,
  actionBtnAttributes = {},
  cancelBtnAttributes = {},
}: Omit<ISnackbarActionButtonProps, 'msg'>) => {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
      }}
    >
      {actionBtnText && (
        <CustomButton onClick={onAction} {...actionBtnAttributes}>
          {actionBtnText}
        </CustomButton>
      )}
      {!hideCloseButton && (
        <>
          {cancelBtnText && (
            <CustomButton onClick={onCancel} {...cancelBtnAttributes}>
              {cancelBtnText}
            </CustomButton>
          )}
          {!cancelBtnText && <StyledCloseButton onClick={onCancel} />}
        </>
      )}
    </Box>
  );
};

export default SnackbarActionButtons;
