// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps, SvgIcon } from '@mui/material';

// TODO  Warning: React does not recognize the `titleId` prop on a DOM element. If you intentionally want it to appear in the DOM as a custom attribute, spell it as lowercase `titleid` instead. If you accidentally passed it from a parent component, remove it from the DOM element.
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
