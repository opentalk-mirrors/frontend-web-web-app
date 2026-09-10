// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import DesktopMeetingHeaderLegacy from './DesktopMeetingHeaderLegacy';

// New (v2) desktop header. Delegates to the legacy header for now; build the redesign out here.
const DesktopMeetingHeader = () => {
  // V2-CLEANUP: delegates to the legacy header for now; build the redesign out here and drop the delegation
  return <DesktopMeetingHeaderLegacy />;
};

export default DesktopMeetingHeader;
