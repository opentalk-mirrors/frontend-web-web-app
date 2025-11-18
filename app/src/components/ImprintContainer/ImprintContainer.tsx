// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled } from '@mui/material';
import { Fragment, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from '../../hooks';
import { selectDataProtectionUrl, selectImprintUrl } from '../../store/slices/configSlice';

const Container = styled('footer')({
  width: '100%',
  color: 'white',
  padding: '1rem',
  textAlign: 'center',
});

const StyledLink = styled('a')(({ theme }) => ({
  color: theme.palette.common.white,
  textDecoration: 'none',
}));

type LinkItem = {
  key: string;
  href: string;
  label: string;
};

const ImprintContainer = () => {
  const { t } = useTranslation();
  const imprintUrl = useAppSelector(selectImprintUrl);
  const dataProtectionUrl = useAppSelector(selectDataProtectionUrl);

  const linkItems = useMemo<LinkItem[]>(() => {
    const items: LinkItem[] = [];

    if (imprintUrl) {
      items.push({ key: 'imprint', href: imprintUrl, label: t('imprint-label') });
    }

    if (dataProtectionUrl) {
      items.push({ key: 'data-protection', href: dataProtectionUrl, label: t('data-protection-label') });
    }

    return items;
  }, [dataProtectionUrl, imprintUrl, t]);

  if (!linkItems.length) {
    return null;
  }

  return (
    <Container data-testid="ImprintContainer">
      {linkItems.map(({ key, href, label }, index) => (
        <Fragment key={key}>
          {index > 0 && <span aria-hidden="true"> - </span>}
          <StyledLink href={href} rel="noreferrer" target="_blank">
            {label}
          </StyledLink>
        </Fragment>
      ))}
    </Container>
  );
};

export default ImprintContainer;
