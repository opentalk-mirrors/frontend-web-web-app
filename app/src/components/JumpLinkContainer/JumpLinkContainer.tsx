// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { ModerationTabKey } from '../../config/moderationTabs';
import { MY_MEETING_MENU_BUTTON_ID, CHAT_INPUT_ID, ToolbarButtonIds } from '../../constants';
import { useAppSelector } from '../../hooks';
import { selectIsModerator } from '../../store/slices/userSlice';
import { JumpLink } from './fragments/JumpLink';

const Nav = styled('nav')(() => ({
  position: 'absolute',
}));

const JumpLinkContainer = () => {
  const isModerator = useAppSelector(selectIsModerator);
  const { t } = useTranslation();
  return (
    <Nav aria-label={t('jumplink-nav-label')}>
      <JumpLink to={`#${CHAT_INPUT_ID}`} text={`${t('jumplink-skip-to')} ${t('jumplink-chat')}`} />
      {isModerator && (
        <JumpLink
          to={`#${ModerationTabKey.Home}`}
          text={`${t('jumplink-skip-to')} ${t('landmark-complementary-moderation-panel')}`}
        />
      )}
      <JumpLink
        to={`#${MY_MEETING_MENU_BUTTON_ID}`}
        text={`${t('jumplink-skip-to')} ${t('jumplink-my-meeting-menu')}`}
      />
      <JumpLink
        to={`#${ToolbarButtonIds.Handraise}`}
        text={`${t('jumplink-skip-to')} ${t('landmark-complementary-toolbar')}`}
      />
    </Nav>
  );
};

export default JumpLinkContainer;
