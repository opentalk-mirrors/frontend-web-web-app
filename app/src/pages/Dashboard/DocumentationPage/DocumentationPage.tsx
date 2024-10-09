// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Typography, TableContainer, Table, TableRow, TableCell, Paper, Button, TableBody } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useQuickStartUrl } from '../../../hooks/useQuickStartUrl';
import { useUpdateDocumentTitle } from '../../../hooks/useUpdateDocumentTitle';

const DocumentationPage = () => {
  const { t } = useTranslation();
  const { dashboardQuickStartUrl, conferenceQuickStartUrl } = useQuickStartUrl();
  const pageHeading = t('dashboard-help-documentation');

  useUpdateDocumentTitle(pageHeading);

  const openQuickStart = (url: string | undefined) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      throw new Error('Quick start url is not defined');
    }
  };

  return (
    <>
      <Typography variant="h1">{pageHeading}</Typography>{' '}
      <TableContainer component={Paper} sx={{ mt: 2, mb: 2, maxHeight: 250, maxWidth: 1000 }}>
        <Table padding="normal" stickyHeader>
          <TableBody>
            <TableRow>
              <TableCell>{t('dashboard-quick-start-title')}</TableCell>
              <TableCell>
                <Button color="secondary" onClick={() => openQuickStart(dashboardQuickStartUrl)}>
                  {t('global-open')}
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('conference-quick-start-title')}</TableCell>
              <TableCell>
                <Button color="secondary" onClick={() => openQuickStart(conferenceQuickStartUrl)}>
                  {t('global-open')}
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default DocumentationPage;
