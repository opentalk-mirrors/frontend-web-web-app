// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Switch, SwitchProps } from '@mui/material';
import { KeyboardEvent } from 'react';

// Add `Enter` key activation to the standard MUI Switches
// Note: Switches inside Formik, has they're own logic. We cannot use this component there.
//       Refer to exisiting implemenation in the formik-related components.
const CommonSwitch = (props: SwitchProps) => {
  const { onChange, checked, ...rest } = props;

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.code === 'Enter' && onChange) {
      const fakeEvent = { target: { checked: !checked } } as React.ChangeEvent<HTMLInputElement>;
      onChange(fakeEvent, !checked);
    }
  };

  return <Switch {...rest} checked={checked} onChange={onChange} onKeyDown={handleKeyDown} />;
};

export default CommonSwitch;
