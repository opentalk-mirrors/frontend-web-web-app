// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled, Typography, Stack, IconButton, Box, useTheme, Skeleton, List, ListItem } from '@mui/material';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary';
import { isTimelessEvent } from '@opentalk/rest-api-rtk-query';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ArrowDownIcon } from '../../../../assets/icons';
import MeetingCard from '../../../../components/MeetingCard';
import { MeetingsProp } from '../types';

interface MeetingsOverviewProp {
  entries: MeetingsProp[];
  expandAccordion: string;
  setExpandAccordion: Dispatch<SetStateAction<string>>;
  isLoading: boolean;
  isFetching: boolean;
}

const Accordion = styled(({ children, ...props }: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...props}>
    {children}
  </MuiAccordion>
))({
  backgroundColor: 'transparent',
  width: '100%',
  ':before': {
    display: 'none',
  },
});

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary expandIcon={<ArrowDownIcon sx={{ fontSize: '0.9rem' }} />} {...props} />
))(({ theme }) => ({
  backgroundColor: 'transparent',
  borderBottom: `3px solid ${theme.palette.secondary.dark}`,
  justifyContent: 'flex-start',
  '& .MuiAccordionSummary-content': {
    marginLeft: theme.spacing(-2),
    flexGrow: 'unset',
    paddingRight: theme.spacing(1),
  },
  '&:before': {
    backgroundColor: 'none',
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(0, 0, 0, .125)',
  marginLeft: theme.spacing(-2),
}));

const ArrowDownButton = styled(IconButton, { shouldForwardProp: (prop) => prop !== 'active' })<{
  active?: boolean;
}>(({ active }) => ({
  position: 'absolute',
  top: 0,
  right: 0,
  background: 'transparent',
  zIndex: 1,
  svg: {
    width: 40,
    height: 24,
    transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    transform: active ? 'rotate(180deg)' : 'none',
  },
  '&:hover': {
    background: 'transparent',
  },
}));

const EventsOverview = ({
  entries,
  expandAccordion,
  setExpandAccordion,
  isLoading,
  isFetching,
}: MeetingsOverviewProp) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState<string[]>([]);
  const marginTopReset = theme.spacing(2);
  const { t } = useTranslation();

  const handleChange = (panel: string) => (_event: React.SyntheticEvent, newExpanded: boolean) => {
    setExpanded(newExpanded ? [...expanded, panel] : expanded.filter((e) => e !== panel));
  };

  useEffect(() => {
    if (expandAccordion === 'all') {
      setExpanded(entries.map((event) => event.title));
    } else {
      setExpanded([expandAccordion]);
    }
  }, [expandAccordion, entries]);

  if (isLoading || isFetching) {
    return (
      <Stack spacing={3}>
        <Skeleton variant="text" width="20%" height={40} />
        <Skeleton variant="rectangular" height={50} />
        <Skeleton variant="rectangular" height={50} />
        <Skeleton variant="rectangular" height={50} />
      </Stack>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      component="section"
      flex="1 1 auto"
      style={{ marginTop: marginTopReset }}
    >
      <Stack spacing={1} overflow="auto" flex="1 1 auto" height={0} position="relative">
        <ArrowDownButton
          active={expandAccordion === 'all'}
          onClick={() => setExpandAccordion((prev: string) => (prev === 'all' ? '' : 'all'))}
          aria-label={t(`global-${expandAccordion === 'all' ? 'collapse' : 'expand'}`, {
            target: t('global-meeting', { count: 2 }),
          })}
        >
          <ArrowDownIcon color="secondary" />
        </ArrowDownButton>
        {entries.map((entry) => {
          const isExpanded = expandAccordion === 'all' || expanded.includes(entry.title);

          return (
            <Accordion
              data-testid="EventAccordion"
              expanded={isExpanded}
              onChange={handleChange(entry.title)}
              key={entry.title}
              slotProps={{
                transition: {
                  unmountOnExit: true,
                },
              }}
            >
              <AccordionSummary
                aria-controls={`${entry.title}-control`}
                id={`${entry.title}-panel`}
                aria-label={t(`global-${isExpanded ? 'collapse' : 'expand'}`, { target: entry.title })}
                aria-expanded={undefined}
              >
                <Typography>{entry.title}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {entry.events?.map((event) => (
                    <ListItem
                      key={`${isTimelessEvent(event) ? event.id : event.id + event.startsAt?.datetime}`}
                      disableGutters
                    >
                      <MeetingCard event={event} overview />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Stack>
    </Box>
  );
};

export default EventsOverview;
