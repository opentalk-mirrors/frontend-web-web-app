// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps, SvgIcon } from '@mui/material';

const AccessibleSvgIcon = (props: SvgIconProps) => {
  const { type, ...restProps } = props;

  const calculateAriaHidden = () => {
    if (!type || type === 'decorative') {
      return true;
    }
    return undefined;
  };

  return (
    <SvgIcon
      {...restProps}
      inheritViewBox
      aria-hidden={calculateAriaHidden()}
      role={type === 'functional' ? 'img' : undefined}
    />
  );
};

export default AccessibleSvgIcon;
