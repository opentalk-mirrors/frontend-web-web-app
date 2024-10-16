// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useIsMobile } from '../../hooks/useMediaQuery';
import MobileMeetingHeader from './Mobile/MobileMeetingHeader';
import DesktopMeetingHeader from './fragments/DesktopMeetingHeader';

const MeetingHeader = () => {
  const isMobile = useIsMobile();

  return isMobile ? <MobileMeetingHeader /> : <DesktopMeetingHeader />;
};

export default MeetingHeader;
