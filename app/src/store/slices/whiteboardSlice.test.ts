// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ExcalidrawElements } from '../../api/types/incoming/whiteboard';
import { switchedRoom, SwitchedRoomPayload } from './breakoutSlice';
import reducer from './whiteboardSlice';

const initialState = reducer(undefined, { type: '@@INIT' });

describe('whiteboard slice', () => {
  describe('switchedRoom', () => {
    it('clears the whiteboard when switching to a room without an active excalidraw session', () => {
      const populatedState = reducer(
        initialState,
        switchedRoom({
          ownData: {
            excalidraw: { scene: { elements: [] as ExcalidrawElements }, editRestrictions: { type: 'disabled' } },
          },
        } as unknown as SwitchedRoomPayload)
      );

      const state = reducer(populatedState, switchedRoom({ ownData: undefined } as unknown as SwitchedRoomPayload));

      expect(state).toEqual(initialState);
    });

    it('applies the destination room excalidraw scene and edit restrictions when switching to a room that has one', () => {
      const elements = [{ id: 'element-1' }] as unknown as ExcalidrawElements;

      const state = reducer(
        initialState,
        switchedRoom({
          ownData: {
            excalidraw: {
              scene: { elements },
              editRestrictions: { type: 'enabled', unrestrictedParticipants: ['participant-1'] },
            },
          },
        } as unknown as SwitchedRoomPayload)
      );

      expect(state).toEqual({
        ...initialState,
        isWhiteboardAvailable: true,
        scene: { elements },
        editRestrictions: { enabled: true, unrestrictedParticipants: ['participant-1'] },
      });
    });

    it('drops the state of the room we left when the destination room has an excalidraw session', () => {
      const staleState = {
        ...initialState,
        whiteboardAssetList: [{ assetId: 'asset-1', filename: 'whiteboard.pdf' }],
        collaborators: { 'participant-1': { displayName: 'Participant One' } },
        lastUpdateFrom: 'participant-1',
        spacedeck: { url: 'https://spacedeck.example/board' },
      } as unknown as ReturnType<typeof reducer>;

      const state = reducer(
        staleState,
        switchedRoom({
          ownData: {
            excalidraw: {
              scene: { elements: [] as ExcalidrawElements },
              editRestrictions: { type: 'disabled' },
            },
          },
        } as unknown as SwitchedRoomPayload)
      );

      expect(state).toEqual({ ...initialState, isWhiteboardAvailable: true });
    });
  });
});
