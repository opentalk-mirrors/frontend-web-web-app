// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled, Link as MUILink } from '@mui/material';
import { Trans } from 'react-i18next';

const Link = styled(MUILink)(({ theme }) => ({
  color: theme.palette.common.white,
}));

export interface NotificationProps {
  translationKey: string;
  url?: string;
}

export const WithLinkNotification = (props: NotificationProps) => {
  const { translationKey, url } = props;

  // "href" of <a> element shouldn't be undefined to be A11Y compliant
  // Therefore if url is undefined, we render jsut a <span>
  const getLinkComponent = () => {
    if (url) {
      return <Link target="_blank" href={url} />;
    }
    return <span />;
  };

  return (
    <Trans
      i18nKey={translationKey}
      components={{
        messageLink: getLinkComponent(),
        messageContainer: <div />,
      }}
    />
  );
};
