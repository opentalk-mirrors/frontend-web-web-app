// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import useConferenceUiVersion from '../../hooks/useConferenceUiVersion';
import { useIsMobile } from '../../hooks/useMediaQuery';
import MobileMeetingHeader from './Mobile/MobileMeetingHeader';
import DesktopMeetingHeader from './fragments/DesktopMeetingHeader';
import DesktopMeetingHeaderLegacy from './fragments/DesktopMeetingHeaderLegacy';

const MeetingHeader = () => {
  const { isV2 } = useConferenceUiVersion();
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileMeetingHeader />;
  }

  // V2-CLEANUP: render <DesktopMeetingHeader /> unconditionally and drop DesktopMeetingHeaderLegacy
  return isV2 ? <DesktopMeetingHeader /> : <DesktopMeetingHeaderLegacy />;
};

export default MeetingHeader;
