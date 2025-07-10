// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Dialog, Paper, ThemeProvider, styled } from '@mui/material';

import { createOpenTalkTheme } from '../../assets/themes/opentalk';
import { useIsMobile } from '../../hooks/useMediaQuery';
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

  return (
    <ThemeProvider theme={createOpenTalkTheme('light')}>
      <Dialog PaperComponent={StyledPaper} onClose={onClose} open={open} maxWidth="md" fullWidth>
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
