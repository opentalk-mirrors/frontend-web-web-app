// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Dialog, Paper, ThemeProvider, styled } from '@mui/material';
import { useEffect } from 'react';

import { createOpenTalkTheme } from '../../assets/themes/opentalk';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { useFullscreenContext } from '../../provider/FullscreenProvider';
import DesktopDialogContent from './fragments/DesktopDialogContent';
import MobileDialogContent from './fragments/MobileDialogContent';
import { MeetingSettings } from './fragments/settingPanels';

const DEFAULT_SETTING: MeetingSettings = 'audio';

const StyledPaper = styled(Paper)(() => ({
  backgroundColor: 'transparent',
  boxShadow: 'none',
}));

interface MeetingSettingsProps {
  open: boolean;
  onClose: () => void;
  setting?: MeetingSettings;
}

const MeetingSettingsDialog = (props: MeetingSettingsProps) => {
  const { open, onClose, setting = DEFAULT_SETTING } = props;
  const isMobile = useIsMobile();
  const fullscreenHandle = useFullscreenContext();

  // In fullscreen mode we need to insert the dialog into the fullscreen element to make it visible
  const container = fullscreenHandle.active ? fullscreenHandle.rootElement : document.body;

  useEffect(() => {
    if (fullscreenHandle.active) {
      if (open) {
        fullscreenHandle.setHasActiveOverlay(true);
      } else {
        fullscreenHandle.setHasActiveOverlay(false);
      }
    }
    return () => {
      if (fullscreenHandle.active) {
        fullscreenHandle.setHasActiveOverlay(false);
      }
    };
  }, [open]);

  return (
    <ThemeProvider theme={createOpenTalkTheme('light')}>
      <Dialog PaperComponent={StyledPaper} container={container} onClose={onClose} open={open} maxWidth="md" fullWidth>
        {isMobile ? (
          <MobileDialogContent onClose={onClose} setting={setting} />
        ) : (
          <DesktopDialogContent onClose={onClose} setting={setting} />
        )}
      </Dialog>
    </ThemeProvider>
  );
};

export default MeetingSettingsDialog;
