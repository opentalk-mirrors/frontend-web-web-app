// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Stack, StackProps, Box, styled } from '@mui/material';
import { useState } from 'react';

import { AccordionItem } from '../../../commonComponents';
import { useAppSelector } from '../../../hooks';
import { selectParticipantGroupsSortedAndFiltered } from '../../../store/selectors';
import ParticipantSimpleList from './ParticipantSimpleList';

const ParticipantSimpleListContainer = styled(Box)(({ theme }) => ({
  color: theme.palette.background.highlight.contrastText,
  overflow: 'scroll',
  maxHeight: '30vh',
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
      <AccordionItem
        onChange={() => toggle(groupId)}
        expanded={isExpanded}
        defaultExpanded={true}
        summaryText={groupId}
        headingComponent="h4"
        key={groupId}
      >
        <ParticipantSimpleListContainer
          id={groupId}
          sx={{
            flex: isExpanded ? 1 : 0,
          }}
        >
          <ParticipantSimpleList participants={participants} />
        </ParticipantSimpleListContainer>
      </AccordionItem>
    );

    return accordions;
  }, [] as React.JSX.Element[]);

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
