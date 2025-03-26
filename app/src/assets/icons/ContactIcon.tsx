// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Contact from './source/contact.svg?react';

const ContactIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Contact} />;

export default ContactIcon;
