// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useState } from 'react';

import { DropdownOptions } from '../constants';
import { useOccupancyStrategy } from './useOccupancyStrategy';
import { useRoomLimitStrategy } from './useRoomLimitStrategy';

export function useFormState(totalNumberOfParticipants: number = 1) {
  const [dropdownOption, setDropdownOption] = useState<DropdownOptions>(DropdownOptions.Rooms);
  const [randomDistribution, setRandomDistribution] = useState<boolean>(false);
  const roomLimitStrategy = useRoomLimitStrategy(totalNumberOfParticipants);
  const occupancyStrategy = useOccupancyStrategy(totalNumberOfParticipants);

  const strategyValues = {
    dropdownOption,
    setDropdownOption,
    randomDistribution,
    setRandomDistribution,
    limit: occupancyStrategy.limit,
    changeLimit: occupancyStrategy.handleLimitChange,
    numberOfCreatedRooms: occupancyStrategy.numberOfRooms,
    hasUnpopulatedRooms: occupancyStrategy.hasUnpopulatedRooms,
    hasInsufficientParticipantsInRooms: occupancyStrategy.hasInsufficientParticipantsInRooms,
    assignParticipantToRoom: occupancyStrategy.assignParticipantToRoom,
    removeParticipantFromRoom: occupancyStrategy.removeParticipantFromRoom,
    necessaryNumberOfParticipants: occupancyStrategy.necessaryNumberOfParticipants,
    hasInsufficientParticipants: occupancyStrategy.hasInsufficientParticipants,
    isAssignedToRoom: occupancyStrategy.isAssignedToRoom,
    clearAssignments: occupancyStrategy.clearAssignments,
    clearRoomAssignments: occupancyStrategy.clearRoomAssignments,
    isAssignedToAnyRoom: occupancyStrategy.isAssignedToAnyRoom,
    toBreakoutRooms: occupancyStrategy.toBreakoutRooms,
    toRandomBreakoutRoomPlaceholders: occupancyStrategy.toRandomBreakoutRoomPlaceholders,
    expandedRooms: occupancyStrategy.expandedRooms,
    setExpandedRooms: occupancyStrategy.setExpandedRooms,
  };

  if (dropdownOption === DropdownOptions.Rooms) {
    strategyValues.limit = roomLimitStrategy.limit;
    strategyValues.changeLimit = roomLimitStrategy.handleLimitChange;
    strategyValues.numberOfCreatedRooms = roomLimitStrategy.numberOfRooms;
    strategyValues.hasUnpopulatedRooms = roomLimitStrategy.hasUnpopulatedRooms;
    strategyValues.hasInsufficientParticipantsInRooms = roomLimitStrategy.hasInsufficientParticipantsInRooms;
    strategyValues.assignParticipantToRoom = roomLimitStrategy.assignParticipantToRoom;
    strategyValues.removeParticipantFromRoom = roomLimitStrategy.removeParticipantFromRoom;
    strategyValues.necessaryNumberOfParticipants = roomLimitStrategy.necessaryNumberOfParticipants;
    strategyValues.hasInsufficientParticipants = roomLimitStrategy.hasInsufficientParticipants;
    strategyValues.isAssignedToRoom = roomLimitStrategy.isAssignedToRoom;
    strategyValues.clearAssignments = roomLimitStrategy.clearAssignments;
    strategyValues.clearRoomAssignments = roomLimitStrategy.clearRoomAssignments;
    strategyValues.isAssignedToAnyRoom = roomLimitStrategy.isAssignedToAnyRoom;
    strategyValues.toBreakoutRooms = roomLimitStrategy.toBreakoutRooms;
    strategyValues.toRandomBreakoutRoomPlaceholders = roomLimitStrategy.toRandomBreakoutRoomPlaceholders;
    strategyValues.expandedRooms = roomLimitStrategy.expandedRooms;
    strategyValues.setExpandedRooms = roomLimitStrategy.setExpandedRooms;
  }

  return strategyValues;
}
