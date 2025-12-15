// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, Collapse, ListItemText } from '@mui/material';

import PrimaryNavigationListItem from './PrimaryNavigationListItem';

interface NavigationProps {
  href?: string;
  target?: string;
  Icon: React.JSX.Element;
  collapsedBar: boolean;
  label: string;
  disabled?: boolean;
  isSubmenuOpen?: boolean;
  onClick?: () => void;
}

const PrimaryNavigationEntry = (props: NavigationProps) => {
  return (
    <PrimaryNavigationListItem isSubmenuOpen={props.isSubmenuOpen}>
      <Button
        onClick={props.href ? undefined : props.onClick}
        disabled={props.disabled}
        disableRipple
        aria-label={props.label}
        component={props.href ? 'a' : 'button'}
        target={props.href && props.target ? props.target : undefined}
        href={props.href ? props.href : undefined}
      >
        {props.Icon}
        <Collapse orientation="horizontal" in={!props.collapsedBar}>
          <ListItemText>{props.label}</ListItemText>
        </Collapse>
      </Button>
    </PrimaryNavigationListItem>
  );
};

export default PrimaryNavigationEntry;
