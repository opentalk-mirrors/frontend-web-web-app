// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled, Typography, Stack, StackProps, Box, Button } from '@mui/material';
import { Fragment, useState } from 'react';

import { ArrowDownIcon } from '../../../assets/icons';
import { useAppSelector } from '../../../hooks';
import { selectParticipantGroupsSortedAndFiltered } from '../../../store/selectors';
import ParticipantSimpleList from './ParticipantSimpleList';

const AccordionButton = styled(Button)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-start',
  padding: theme.spacing(0.5),
}));

const ParticipantGroups = (props: StackProps) => {
  const [expandedGroupId, setExpandedGroupId] = useState<string>('');
  const participantGroups = useAppSelector(selectParticipantGroupsSortedAndFiltered);

  if (participantGroups.size === 0) {
    return null;
  }

  const toggle = (groupId: string) => {
    setExpandedGroupId((currentGroupId) => (currentGroupId === groupId ? '' : groupId));
  };

  const Groups = Array.from(participantGroups).reduce((accordions, [groupId, participants]) => {
    if (participants.length === 0) {
      return accordions;
    }

    const isExpanded = groupId === expandedGroupId;

    accordions.push(
      <Fragment key={groupId}>
        <AccordionButton
          type="button"
          variant="text"
          color="inherit"
          fullWidth
          aria-controls={groupId}
          aria-expanded={isExpanded}
          onClick={() => toggle(groupId)}
          focusRipple={true}
        >
          <ArrowDownIcon
            sx={{
              width: '0.6em',
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 0.3s ease-in',
              marginRight: 1,
            }}
          />
          <Typography variant="caption">{groupId}</Typography>
        </AccordionButton>
        <Box
          id={groupId}
          sx={{
            overflow: 'hidden',
            flex: isExpanded ? 1 : 0,
          }}
        >
          <ParticipantSimpleList participants={participants} />
        </Box>
      </Fragment>
    );

    return accordions;
  }, [] as JSX.Element[]);

  return (
    <Stack
      {...props}
      sx={[
        {
          overflow: 'hidden',
        },
        ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
      ]}
    >
      {Groups}
    </Stack>
  );
};

export default ParticipantGroups;
