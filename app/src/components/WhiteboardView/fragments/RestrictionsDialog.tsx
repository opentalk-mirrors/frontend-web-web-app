// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  styled,
  Typography,
} from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { disableEditRestrictions, enableEditRestrictions } from '../../../api/types/outgoing/whiteboard';
import { CommonSwitch, CommonTextField, ParticipantAvatar } from '../../../commonComponents';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { selectCombinedParticipantsAndUserInConference, selectModeratorParticipantIds } from '../../../store/selectors';
import { selectIsModerator } from '../../../store/slices/userSlice';
import { selectWhiteboardEditRestrictions } from '../../../store/slices/whiteboardSlice';
import { ParticipantId, Role } from '../../../types';

const StyledCommonSwitch = styled(CommonSwitch)(({ theme }) => ({
  marginRight: theme.spacing(1.5),
}));

const RestrictionsList = styled(List)({
  maxHeight: 320,
  overflow: 'auto',
});

const RestrictionsDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isModerator = useAppSelector(selectIsModerator);
  const [participantSearchValue, setParticipantSearchValue] = useState('');
  const moderatorParticipantIds = useAppSelector(selectModeratorParticipantIds);
  const conferenceParticipants = useAppSelector(selectCombinedParticipantsAndUserInConference);
  const { enabled: editRestrictionsEnabled, unrestrictedParticipants } = useAppSelector(
    selectWhiteboardEditRestrictions
  );
  const [draftRestrictionsEnabled, setDraftRestrictionsEnabled] = useState(editRestrictionsEnabled);
  const [draftUnrestrictedParticipants, setDraftUnrestrictedParticipants] = useState(unrestrictedParticipants);

  const editableParticipants = useMemo(() => {
    const normalizedSearch = participantSearchValue.trim().toLocaleLowerCase();

    return [...conferenceParticipants]
      .filter((participant) => participant.role !== Role.Moderator)
      .sort((first, second) => first.displayName.localeCompare(second.displayName))
      .filter((participant) =>
        normalizedSearch.length === 0 ? true : participant.displayName.toLocaleLowerCase().includes(normalizedSearch)
      );
  }, [conferenceParticipants, participantSearchValue]);

  const closeRestrictionsDialog = useCallback(() => {
    onClose();
    setParticipantSearchValue('');
  }, [onClose]);

  const handleRestrictionsToggle = useCallback((checked: boolean) => {
    setDraftRestrictionsEnabled(checked);
  }, []);

  const handleParticipantRestrictionToggle = useCallback((participantId: ParticipantId, checked: boolean) => {
    setDraftUnrestrictedParticipants((currentParticipants) => {
      if (checked) {
        return Array.from(new Set<ParticipantId>([...currentParticipants, participantId]));
      }

      return currentParticipants.filter((currentParticipantId) => currentParticipantId !== participantId);
    });
  }, []);

  const applyRestrictions = useCallback(() => {
    if (!isModerator) {
      return;
    }

    if (!draftRestrictionsEnabled) {
      dispatch(disableEditRestrictions.action());
      closeRestrictionsDialog();
      return;
    }

    dispatch(
      enableEditRestrictions.action({
        unrestrictedParticipants: Array.from(new Set(draftUnrestrictedParticipants)).filter(
          (participantId) => !moderatorParticipantIds.has(participantId)
        ),
      })
    );
    closeRestrictionsDialog();
  }, [
    closeRestrictionsDialog,
    dispatch,
    draftRestrictionsEnabled,
    draftUnrestrictedParticipants,
    isModerator,
    moderatorParticipantIds,
  ]);

  return (
    <Dialog open={open} onClose={closeRestrictionsDialog} fullWidth maxWidth="sm">
      <DialogTitle>{t('whiteboard-dialog-edit-restrictions-title')}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <FormControlLabel
            label={t('whiteboard-dialog-edit-restrictions-switch-label')}
            control={
              <StyledCommonSwitch
                checked={draftRestrictionsEnabled}
                onChange={(event) => handleRestrictionsToggle(event.target.checked)}
              />
            }
          />
          <Typography variant="body2" color="textSecondary">
            {t('whiteboard-dialog-edit-restrictions-description')}
          </Typography>

          <CommonTextField
            label={t('whiteboard-dialog-edit-restrictions-search-label')}
            size="small"
            value={participantSearchValue}
            onChange={(event) => setParticipantSearchValue(event.target.value)}
            disabled={!draftRestrictionsEnabled}
            fullWidth
          />

          <RestrictionsList dense disablePadding>
            {editableParticipants.map((participant) => {
              const isSelected = draftUnrestrictedParticipants.includes(participant.id);

              return (
                <ListItemButton
                  key={participant.id}
                  onClick={() => handleParticipantRestrictionToggle(participant.id, !isSelected)}
                  disabled={!draftRestrictionsEnabled}
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={isSelected}
                      tabIndex={-1}
                      disableRipple
                      slotProps={{
                        input: {
                          'aria-label': participant.displayName,
                        },
                      }}
                    />
                  </ListItemIcon>
                  <ParticipantAvatar src={participant.avatarUrl}>{participant.displayName}</ParticipantAvatar>
                  <ListItemText sx={{ ml: 2 }} primary={participant.displayName} />
                </ListItemButton>
              );
            })}
            {editableParticipants.length === 0 && (
              <Box px={2} py={3}>
                <Typography variant="body2" color="textSecondary">
                  {t('whiteboard-dialog-edit-restrictions-empty')}
                </Typography>
              </Box>
            )}
          </RestrictionsList>
        </Stack>
      </DialogContent>
      <DialogActions style={{ alignItems: 'center' }}>
        <Stack spacing={2} direction="row">
          <Button onClick={closeRestrictionsDialog} variant="text">
            {t('global-cancel')}
          </Button>
          <Button onClick={applyRestrictions}>{t('global-submit')}</Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default RestrictionsDialog;
