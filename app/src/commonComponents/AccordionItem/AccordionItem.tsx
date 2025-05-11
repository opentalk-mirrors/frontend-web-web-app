// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  Accordion as MuiAccordion,
  AccordionDetails as MuiAccordionDetails,
  AccordionSummary as MuiAccordionSummary,
  styled,
  Typography,
  Box,
} from '@mui/material';
import { uniqueId } from 'lodash';
import React, { SyntheticEvent, useState } from 'react';

import { ArrowDownIcon } from '../../assets/icons';

interface AccordionItemProps {
  onChange: (event: SyntheticEvent<Element, Event>, newExpanded: boolean) => void;
  expanded: boolean;
  defaultExpanded?: boolean;
  summaryText: string;
  summaryEndAdornment?: React.ReactNode;
  children: React.ReactNode;
  headingComponent?: React.ElementType;
}

const Accordion = styled(MuiAccordion)(({ theme }) => ({
  width: '100%',
  backgroundColor: 'transparent',
  boxShadow: 'none',
  margin: theme.spacing(0),
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&:before': {
    display: 'none',
  },
  '&.Mui-expanded': {
    margin: theme.spacing(0),
  },
}));

const AccordionSummary = styled(MuiAccordionSummary)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.lighter,
  minHeight: 0,
  '&.Mui-expanded': {
    minHeight: 0,
  },
  flexDirection: 'row-reverse',
  padding: 0,
  '& .MuiSvgIcon-root': {
    width: '1rem',
    fill: 'currentColor',
  },
  '& .MuiAccordionSummary-expandIconWrapper': {
    '& svg': {
      width: '0.75rem',
      fill: 'currentColor',
    },
    color: 'inherit',
    padding: theme.spacing(1.25, 1.5, 1.25, 2),
    marginRight: 0,
  },
  '& .MuiAccordionSummary-content': {
    alignItems: 'center',
    '& > svg': {
      width: '1.25rem',
      fill: 'currentColor',
      marginRight: '1ex',
    },
    margin: 0,
    '&.Mui-expanded': {
      margin: 0,
    },
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(1),
  margin: 0,
}));

const SummaryText = styled(Typography)<{ component: string }>(({ theme }) => ({
  color: 'inherit',
  padding: theme.spacing(1, 0),
}));

function AccordionItem({
  onChange,
  expanded,
  defaultExpanded = false,
  summaryText,
  children,
  summaryEndAdornment,
  headingComponent,
}: AccordionItemProps) {
  const [id] = useState(() => uniqueId('ot-accordion-'));
  return (
    <Accordion
      square
      defaultExpanded={defaultExpanded}
      expanded={expanded}
      onChange={onChange}
      slotProps={{ heading: { component: headingComponent } }}
    >
      <AccordionSummary
        aria-controls={`${id}-content`}
        id={`${id}-header`}
        expandIcon={<ArrowDownIcon />}
        sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}
      >
        <SummaryText component="span" variant="caption" sx={{ flexGrow: 1 }}>
          {summaryText}
        </SummaryText>
        {summaryEndAdornment && <Box sx={{ pt: 0.5, whiteSpace: 'nowrap' }}>{summaryEndAdornment}</Box>}
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
}

export default AccordionItem;
