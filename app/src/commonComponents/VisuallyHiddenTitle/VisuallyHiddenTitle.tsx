// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Typography } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { useTranslation } from 'react-i18next';

interface VisuallyHiddenTitleProps {
  label: string;
  component: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span';
  id?: string;
}

const VisuallyHiddenTitle = ({ label, component, id }: VisuallyHiddenTitleProps) => {
  const { t } = useTranslation();
  return (
    <Typography component={component} sx={visuallyHidden} id={id}>
      {t(label)}
    </Typography>
  );
};

export default VisuallyHiddenTitle;
