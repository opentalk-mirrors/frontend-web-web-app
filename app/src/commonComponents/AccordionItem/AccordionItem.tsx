// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  Accordion as MuiAccordion,
  AccordionDetails as MuiAccordionDetails,
  AccordionSummary as MuiAccordionSummary,
  styled,
  Typography,
} from '@mui/material';
import { kebabCase } from 'lodash';
import React, { SyntheticEvent } from 'react';

import { ArrowDownIcon } from '../../assets/icons';

interface IAccordionProps<T extends string> {
  onChange: (event: SyntheticEvent<Element, Event>, newExpanded: boolean) => void;
  option: T;
  expanded: boolean;
  summaryText: string;
  summaryIcon?: React.ReactNode;
  children: React.ReactNode;
  editComponent?: React.ReactNode;
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

const EditButtonContainer = styled('div')({
  position: 'absolute',
  right: 0,
});

function AccordionItem<T extends string>({
  onChange,
  option,
  expanded,
  summaryText,
  summaryIcon,
  children,
  editComponent,
}: IAccordionProps<T>) {
  return (
    <Accordion square expanded={expanded} onChange={onChange}>
      <AccordionSummary
        aria-controls={`${kebabCase(option)}-content`}
        id={`${kebabCase(option)}-header`}
        expandIcon={<ArrowDownIcon />}
      >
        {summaryIcon && summaryIcon}
        <SummaryText component="span" variant="caption">
          {summaryText}
        </SummaryText>
        <EditButtonContainer>{editComponent && editComponent}</EditButtonContainer>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
}

export default AccordionItem;
