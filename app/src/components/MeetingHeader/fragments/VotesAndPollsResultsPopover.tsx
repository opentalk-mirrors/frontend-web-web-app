// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Popover } from '@mui/material';
import { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { PollIcon } from '../../../assets/icons';
import { useAppSelector } from '../../../hooks';
import { selectActivePollsAndVotingsCount, selectPollsAndVotingsCount } from '../../../store/selectors';
import { generateUniqueId } from '../../../utils/stringUtils';
import { MeetingHeaderButton } from './MeetingHeaderButton';
import ResultsList from './ResultsList';

type RenderButtonProps = Partial<{
  isPopoverOpen: boolean;
  id: string;
  label: string;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
  active: boolean;
}>;

type RenderButtonFunc = (props: RenderButtonProps) => ReactElement | null;

const VotesAndPollsResultsPopover = ({ renderButton }: { renderButton?: RenderButtonFunc }) => {
  const id = generateUniqueId();
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const votingsAndPollsCount = useAppSelector(selectPollsAndVotingsCount);
  const hasVotingsOrPolls = votingsAndPollsCount > 0;
  const activeVotesOrPolls = useAppSelector(selectActivePollsAndVotingsCount);
  const hasActiveVotesOrPolls = activeVotesOrPolls > 0;
  const { t } = useTranslation();

  const isPopoverOpen = Boolean(anchorElement);

  const Button =
    typeof renderButton !== 'function' ? (
      <MeetingHeaderButton
        aria-expanded={isPopoverOpen}
        aria-controls={id}
        aria-haspopup="menu"
        aria-label={t('votes-poll-button-show')}
        onClick={(event) => setAnchorElement(event.currentTarget)}
        active={hasActiveVotesOrPolls}
      >
        <PollIcon />
      </MeetingHeaderButton>
    ) : (
      renderButton({
        isPopoverOpen,
        id,
        label: t('votes-poll-button-show'),
        onClick: (event: React.MouseEvent<HTMLElement>) => setAnchorElement(event.currentTarget),
        active: hasActiveVotesOrPolls,
      })
    );

  if (!hasVotingsOrPolls) {
    return null;
  }

  return (
    <>
      {Button}
      <Popover
        id={id}
        open={isPopoverOpen}
        onClose={() => setAnchorElement(null)}
        anchorEl={anchorElement}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        disablePortal
      >
        <ResultsList />
      </Popover>
    </>
  );
};

export default VotesAndPollsResultsPopover;
