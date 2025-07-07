// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen } from '@testing-library/react';

import { WhisperParticipantState } from '../../../types';
import WhisperStateIcon from './WhisperStateIcon';

jest.mock('../../../assets/icons', () => ({
  WhisperEmptyIcon: () => <svg data-testid="whisper-empty-icon" />,
  WhisperFullIcon: () => <svg data-testid="whisper-full-icon" />,
}));

describe('WhisperStateIcon', () => {
  it('renders WhisperEmptyIcon for Invited state', () => {
    render(<WhisperStateIcon state={WhisperParticipantState.Invited} />);
    expect(screen.getByTestId('whisper-empty-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('whisper-full-icon')).not.toBeInTheDocument();
  });

  it('renders WhisperFullIcon for Accepted state', () => {
    render(<WhisperStateIcon state={WhisperParticipantState.Accepted} />);
    expect(screen.getByTestId('whisper-full-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('whisper-empty-icon')).not.toBeInTheDocument();
  });

  it('renders WhisperFullIcon for Creator state', () => {
    render(<WhisperStateIcon state={WhisperParticipantState.Creator} />);
    expect(screen.getByTestId('whisper-full-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('whisper-empty-icon')).not.toBeInTheDocument();
  });

  it('renders nothing for undefined state', () => {
    const { container } = render(<WhisperStateIcon />);
    const { firstChild } = container;

    expect(firstChild).toBeNull();
  });
});
