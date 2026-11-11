// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Dialog } from '@mui/material';

import { useAppSelector } from '../../hooks';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { selectFullscreenContainer } from '../../store/slices/fullscreen/slice';
import DesktopDialogContent from './fragments/DesktopDialogContent';
import MobileDialogContent from './fragments/MobileDialogContent';
import { MeetingSettings } from './fragments/settingPanels';

const DEFAULT_SETTING: MeetingSettings = 'audio';

interface MeetingSettingsProps {
  open: boolean;
  onClose: () => void;
  setting?: MeetingSettings;
}

const MeetingSettingsDialog = (props: MeetingSettingsProps) => {
  const { open, onClose, setting = DEFAULT_SETTING } = props;
  const isMobile = useIsMobile();
  const container = useAppSelector(selectFullscreenContainer);

  return (
    <Dialog container={container} onClose={onClose} open={open} maxWidth="md" fullWidth>
      {isMobile ? (
        <MobileDialogContent onClose={onClose} setting={setting} />
      ) : (
        <DesktopDialogContent onClose={onClose} setting={setting} />
      )}
    </Dialog>
  );
};

export default MeetingSettingsDialog;
