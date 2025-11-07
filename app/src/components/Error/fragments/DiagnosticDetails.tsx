// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, Collapse, Stack, Typography, styled } from '@mui/material';
import { ErrorInfo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ArrowDownIcon, ArrowUpIcon } from '../../../assets/icons';
import { useAppSelector } from '../../../hooks';
import { selectErrorReportEmail } from '../../../store/slices/configSlice';

interface DiagnosticDetailsProps {
  error: Error;
  errorInfo?: ErrorInfo;
}

const DiagnosticDataElement = styled(Stack)({
  maxHeight: '15em',
  width: '100%',
  overflow: 'auto',
});
const CollapseButton = styled(Button)({
  boxShadow: 'none',
  backgroundColor: 'transparent',
  '&:hover': {
    boxShadow: 'none',
    backgroundColor: 'transparent',
  },
  '&:active': {
    boxShadow: 'none',
    backgroundColor: 'transparent',
  },
});

const DiagnosticDetails = ({ error, errorInfo }: DiagnosticDetailsProps) => {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(true);
  const email = useAppSelector(selectErrorReportEmail);

  const diagnosticData = {
    cause: error.cause,
    name: error.name,
    message: error.message,
    stack: error.stack,
    errorInfo: errorInfo,
  };

  return (
    <Stack
      spacing={1}
      sx={{
        alignItems: 'center',
      }}
    >
      <CollapseButton
        disableRipple
        size="large"
        startIcon={collapsed ? <ArrowDownIcon /> : <ArrowUpIcon />}
        onClick={() => {
          setCollapsed(!collapsed);
        }}
      >
        {t(`${collapsed ? 'show' : 'hide'}-diagnostic-data-button`)}
      </CollapseButton>
      <DiagnosticDataElement>
        <Collapse orientation="vertical" in={!collapsed}>
          <Typography
            variant="body2"
            color="inherit"
            sx={{
              textAlign: 'left',
            }}
          >
            {JSON.stringify(diagnosticData, null, '\t')}
          </Typography>
        </Collapse>
      </DiagnosticDataElement>
      <Button
        href={`mailto:?to=${email}&body=${encodeURIComponent(
          JSON.stringify(diagnosticData)
        )}&subject='OpenTalk diagnostic data'`}
      >
        {t('send-error-button-text')}
      </Button>
    </Stack>
  );
};

export default DiagnosticDetails;
