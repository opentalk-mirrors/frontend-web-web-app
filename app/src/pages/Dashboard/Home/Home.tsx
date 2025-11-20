// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useHeader } from '../../../hooks/useHeader';
import { useIsDesktop } from '../../../hooks/useMediaQuery';
import { useUpdateDocumentTitle } from '../../../hooks/useUpdateDocumentTitle';
import BannerContainer from './fragments/BannerContainer';
import DesktopHome from './fragments/DesktopHome';
import MobileHome from './fragments/MobileHome';

const Home = () => {
  const { t } = useTranslation();
  const { setHeader } = useHeader();

  const isDesktop = useIsDesktop();

  useEffect(() => {
    setHeader(<BannerContainer />);
    return () => {
      setHeader(undefined);
    };
  }, [setHeader]);

  const pageHeading = t('dashboard-current-meetings');
  useUpdateDocumentTitle(pageHeading);

  return isDesktop ? <DesktopHome pageHeading={pageHeading} /> : <MobileHome />;
};

export default Home;
