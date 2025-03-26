// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Dialog, styled, Typography, DialogTitle } from '@mui/material';

import { CloseIcon } from '../../assets/icons';

const CustomDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    padding: theme.spacing(2),
    '& .MuiDialogTitle-root': {
      padding: theme.spacing(1, 2),
      color: theme.palette.secondary.contrastText,
    },
    '& .MuiTypography-body1': {
      margin: theme.spacing(1, 2),
      color: theme.palette.secondary.dark,
    },
  },
}));
const CloseButtonContainer = styled('span')(({ theme }) => ({
  cursor: 'pointer',
  position: 'absolute',
  top: 0,
  right: 0,
  padding: '1rem',
  display: 'block',

  '& svg': {
    fill: theme.palette.secondary.dark,
    transition: '0.5s',
    width: '1rem',
  },
  '&:hover': {
    '& svg': {
      fill: theme.palette.primary.main,
    },
  },
}));

const StyledCloseIcon = styled(CloseIcon)(() => ({
  fontSize: '1rem',
}));

interface IFontAwesomeProps {
  isOpen: boolean;
  toggleOpen: () => void;
}

const FontAwesome = (props: IFontAwesomeProps) => {
  return (
    <CustomDialog aria-labelledby="customized-dialog-title" open={props.isOpen}>
      <CloseButtonContainer onClick={props.toggleOpen}>
        <StyledCloseIcon />
      </CloseButtonContainer>
      <DialogTitle>Font Awesome License</DialogTitle>

      <Typography variant="body1">
        License Font Awesome Free is free, open source, and GPL friendly. You can use it for commercial projects, open
        source projects, or really almost whatever you want.
      </Typography>

      <Typography variant="body1">Icons — CC BY 4.0 License In the Font Awesome Free</Typography>
      <Typography variant="body1">
        - download, the CC BY 4.0 license applies to all icons packaged as .svg and .js files types.
      </Typography>

      <Typography variant="body1">Fonts — SIL OFL 1.1</Typography>
      <Typography variant="body1">
        - License In the Font Awesome Free download, the SIL OLF license applies to all icons packaged as web and
        desktop font files.
      </Typography>
      <Typography variant="body1">Code — MIT License</Typography>
      <Typography variant="body1">
        - In the Font Awesome Free download, the MIT license applies to all non-font and non-icon files.
      </Typography>

      <Typography variant="body1">
        Attribution is required by MIT, SIL OLF, and CC BY licenses. Downloaded Font Awesome Free files already contain
        embedded comments with sufficient attribution, so you shouldn&apos;t need to do anything additional when using
        these files normally.
      </Typography>

      <Typography variant="body1">
        We&apos;ve kept attribution comments terse, so we ask that you do not actively work to remove them from files,
        especially code. They&apos;re a great way for folks to learn about Font Awesome.
      </Typography>
    </CustomDialog>
  );
};
export default FontAwesome;
