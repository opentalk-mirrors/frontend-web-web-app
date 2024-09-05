// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ParticipantId, LegalVoteOption } from '../../types';
import LinearProgressWithLabel from './LinearProgressWithLabel';

interface PollResultProps {
  votes: Record<LegalVoteOption, number>;
  with_abstain?: boolean;
  voters?: Record<ParticipantId, LegalVoteOption>;
}

// Todo: Make this more generic and the legal Vote version one variation of this, so it can be used with the poll feature as well
const PollResult = ({ votes: { yes, no, abstain }, ...props }: PollResultProps) => {
  const sum = props.with_abstain ? yes + no + abstain : yes + no;
  return (
    <>
      <LinearProgressWithLabel absolute={yes} sum={sum} label="yes" />
      <LinearProgressWithLabel absolute={no} sum={sum} color="secondary" label="no" />
      {props.with_abstain && <LinearProgressWithLabel absolute={abstain} sum={sum} color="secondary" label="abstain" />}
    </>
  );
};

export default PollResult;
