// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { act, renderHook } from '@testing-library/react';

import { ParticipantId } from '../../../../../types';
import { MINIMUM_NUMBER_OF_PARTICIPANTS_PER_ROOM } from '../../constants';
import { useOccupancyStrategy } from '../useOccupancyStrategy';

describe('useOccupancyStrategy', () => {
  it('should initialize with limit being minimum number of participants per room', () => {
    const { result } = renderHook(() => useOccupancyStrategy());
    expect(result.current.limit).toBe(MINIMUM_NUMBER_OF_PARTICIPANTS_PER_ROOM);
  });

  it('should comput number of rooms based on the total number of participants and the limit', () => {
    const totalNumberOfParticipants = 10;
    const { result } = renderHook(() => useOccupancyStrategy(totalNumberOfParticipants));
    expect(result.current.numberOfRooms).toBe(
      Math.ceil(totalNumberOfParticipants / MINIMUM_NUMBER_OF_PARTICIPANTS_PER_ROOM)
    );
  });

  it('should handle limit change', () => {
    const { result } = renderHook(() => useOccupancyStrategy());
    const newLimit = 5;
    act(() => {
      result.current.handleLimitChange(newLimit);
    });
    expect(result.current.limit).toBe(newLimit);
  });

  it('should have all unpopulated rooms by default', () => {
    const { result } = renderHook(() => useOccupancyStrategy());
    expect(result.current.hasUnpopulatedRooms).toBe(true);
  });

  it('should not have unpopulated rooms when all rooms have at least minimumum participant assigned', () => {
    const { result } = renderHook(() => useOccupancyStrategy(4));
    act(() => {
      result.current.handleLimitChange(2);
      result.current.assignParticipantToRoom('participant1' as ParticipantId, 0);
      result.current.assignParticipantToRoom('participant2' as ParticipantId, 0);
      result.current.assignParticipantToRoom('participant3' as ParticipantId, 1);
      result.current.assignParticipantToRoom('participant4' as ParticipantId, 1);
    });
    expect(result.current.hasUnpopulatedRooms).toBe(false);
    expect(result.current.hasInsufficientParticipantsInRooms).toBe(false);
  });

  it('should be able to remove participant from room', () => {
    const { result } = renderHook(() => useOccupancyStrategy());
    act(() => {
      result.current.assignParticipantToRoom('participant1' as ParticipantId, 0);
    });
    expect(result.current.isAssignedToRoom('participant1' as ParticipantId, 0)).toBe(true);
    act(() => {
      result.current.removeParticipantFromRoom('participant1' as ParticipantId, 0);
    });
    expect(result.current.isAssignedToRoom('participant1' as ParticipantId, 0)).toBe(false);
  });

  it('should be able to clear all assignments', () => {
    const { result } = renderHook(() => useOccupancyStrategy());
    act(() => {
      result.current.assignParticipantToRoom('participant1' as ParticipantId, 0);
      result.current.assignParticipantToRoom('participant2' as ParticipantId, 0);
    });
    expect(result.current.hasUnpopulatedRooms).toBe(false);
    act(() => {
      result.current.clearAssignments();
    });
    expect(result.current.hasUnpopulatedRooms).toBe(true);
  });

  it('should be able to remove assignments from particular room', () => {
    const { result } = renderHook(() => useOccupancyStrategy(3));
    act(() => {
      result.current.handleLimitChange(1);
      result.current.assignParticipantToRoom('participant1' as ParticipantId, 0);
      result.current.assignParticipantToRoom('participant2' as ParticipantId, 1);
      result.current.assignParticipantToRoom('participant3' as ParticipantId, 2);
    });
    expect(result.current.isAssignedToAnyRoom('participant2' as ParticipantId)).toBe(true);
    act(() => {
      result.current.clearRoomAssignments(1);
    });
    expect(result.current.isAssignedToAnyRoom('participant2' as ParticipantId)).toBe(false);
  });

  it('should convert all assignments to breakout rooms', () => {
    const { result } = renderHook(() => useOccupancyStrategy(3));
    act(() => {
      result.current.handleLimitChange(1);
      result.current.assignParticipantToRoom('participant1' as ParticipantId, 0);
      result.current.assignParticipantToRoom('participant2' as ParticipantId, 1);
      result.current.assignParticipantToRoom('participant3' as ParticipantId, 2);
    });
    const expectedOutput = [
      { name: 'Room 1', assignments: ['participant1' as ParticipantId] },
      { name: 'Room 2', assignments: ['participant2' as ParticipantId] },
      { name: 'Room 3', assignments: ['participant3' as ParticipantId] },
    ];
    expect(result.current.toBreakoutRooms()).toEqual(expectedOutput);
  });

  it('should randomly populate rooms by respecting minimum number of users per room', () => {
    const { result } = renderHook(() => useOccupancyStrategy(6));
    act(() => {
      result.current.handleLimitChange(2);
    });
    const rooms = result.current.toRandomBreakoutRoomPlaceholders();
    expect(rooms).toHaveLength(3);
    rooms.forEach((room, index) => {
      expect(room.name).toBe(`Room ${index + 1}`);
      expect(room.assignments).toHaveLength(2);
    });
  });

  it('should randomly populate rooms with overflowing participants being distributed in round-robin manner', () => {
    const { result } = renderHook(() => useOccupancyStrategy(13));
    act(() => {
      result.current.handleLimitChange(4);
    });
    const rooms = result.current.toRandomBreakoutRoomPlaceholders();
    expect(rooms).toHaveLength(3);
    expect(rooms[0].assignments).toHaveLength(5);
    expect(rooms[1].assignments).toHaveLength(4);
    expect(rooms[2].assignments).toHaveLength(4);
  });
});
