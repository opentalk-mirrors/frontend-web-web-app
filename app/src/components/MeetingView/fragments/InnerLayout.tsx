// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useIsMobileForFullscreenElements } from '../../../hooks/useMediaQuery';
import MobileInnerLayout from '../Mobile/MobileInnerLayout';
import DesktopInnerLayout from './DesktopInnerLayout';

const InnerLayout = () => {
  const isMobile = useIsMobileForFullscreenElements();

  return isMobile ? <MobileInnerLayout /> : <DesktopInnerLayout />;
};

export default InnerLayout;
