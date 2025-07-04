// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test, expect } from '@playwright/test';

import { startAdhocMeetingAsModerator, joinMeetingRoomWithNGuests } from '../helper/meetingHelpers';
import { ViewOptionsPage } from '../pages/MeetingRoom/ViewOptionsPage';

const NUMBER_OF_GUESTS = 5;
const SMALL_NUMBER_OF_GUESTS = 2;

let viewOptionsPage: ViewOptionsPage;

test.describe('MeetingRoom - adjust participant view', () => {
  test('TC_001_VideoRoom_ParticipantViewSettings_List', async ({ page, browserName }) => {
    const { meetingRoomPage } = await startAdhocMeetingAsModerator(page, browserName);
    viewOptionsPage = new ViewOptionsPage({ page: meetingRoomPage.page });

    // work around for differences between test server and local setup
    viewOptionsPage.allocateViewOptionLocatorsBasedOnSetup();

    // when opening grid view options besides the meeting room name
    await viewOptionsPage.displayViewOptionsMenu();
    await expect(viewOptionsPage.viewAndSortingPopupMenu).toBeVisible();

    // assert grid view shows up with 3 options: Grid-View, Speaker-View, Fullscreen
    await expect(viewOptionsPage.gridViewOption).toBeVisible();
    await expect(await viewOptionsPage.gridViewOption.innerText()).toBe('Grid-View');
    await expect(viewOptionsPage.speakerViewOption).toBeVisible();
    await expect(await viewOptionsPage.speakerViewOption.innerText()).toBe('Speaker-View');
    await expect(viewOptionsPage.fullScreenViewOption).toBeVisible();
    await expect(await viewOptionsPage.fullScreenViewOption.innerText()).toBe('Fullscreen');
    // assert sorting shows up with 2 options: Activated camera first, Moderator(s) first
    await expect(viewOptionsPage.activatedCameraFirstSortingOption).toBeVisible();
    await expect(await viewOptionsPage.activatedCameraFirstSortingOption.innerText()).toBe('Activated camera first');
    await expect(viewOptionsPage.moderatorsFirstSortingOption).toBeVisible();
    await expect(await viewOptionsPage.moderatorsFirstSortingOption.innerText()).toBe('Moderator(s) first');
  });

  test.skip('TC_002_VideoRoom_ParticipantViewSettings_List_SpeakerView', async ({ page, context, browserName }) => {
    test.skip(browserName === 'webkit');

    const { meetingRoomPage, guestLink } = await startAdhocMeetingAsModerator(page);
    viewOptionsPage = new ViewOptionsPage({ page: meetingRoomPage.page });

    // join with 5 guests (in separate browser instances)
    await joinMeetingRoomWithNGuests(meetingRoomPage, context, guestLink, 'guest', NUMBER_OF_GUESTS);
    await expect(await meetingRoomPage.getNumberOfParticipantsInMeeting()).toBe(NUMBER_OF_GUESTS + 1);

    // open grid view options besides the meeting room name
    await viewOptionsPage.displayViewOptionsMenu();

    // choose speaker view
    // grid view should have a tick, but speaker view should have no tick before it is selected
    await expect(await viewOptionsPage.hasTickIcon(viewOptionsPage.gridViewOption)).toBeTruthy();
    await expect(await viewOptionsPage.hasTickIcon(viewOptionsPage.speakerViewOption)).toBeFalsy();
    await viewOptionsPage.selectSpeakerViewOption();
    await expect(await viewOptionsPage.hasTickIcon(viewOptionsPage.speakerViewOption)).toBeTruthy();

    // check the speaker view and pin some users
    const defaultPinnedParticipant = await viewOptionsPage.getPinnedParticipantNameInSpeakerView();
    // speaker is in first place
    await expect(await viewOptionsPage.getFirstParticipantNameInSpeakerView()).toBe(defaultPinnedParticipant);
    // pinned user is shown first among all participant thumbs
    await expect(await viewOptionsPage.getThumbsNthParticipantNameInSpeakerView(1)).toBe(defaultPinnedParticipant);
    // pin some user (3rd participant)
    const pinnedParticipant = await viewOptionsPage.pinNthParticipantInSpeakerView(3);
    await expect(defaultPinnedParticipant).not.toBe(pinnedParticipant);
    await expect(await viewOptionsPage.getPinnedParticipantNameInSpeakerView()).toBe(pinnedParticipant);
    // pin another user (2nd participant)
    const pinnedParticipant2 = await viewOptionsPage.pinNthParticipantInSpeakerView(2);
    await expect(await viewOptionsPage.getPinnedParticipantNameInSpeakerView()).toBe(pinnedParticipant2);
  });

  test('TC_003_VideoRoom_ParticipantViewSettings_List_FullScreen', async ({ page, context, browserName }) => {
    const { meetingRoomPage, guestLink } = await startAdhocMeetingAsModerator(page, browserName);
    viewOptionsPage = new ViewOptionsPage({ page: meetingRoomPage.page });

    // join with 2 guests (in separate browser instances)
    await joinMeetingRoomWithNGuests(meetingRoomPage, context, guestLink, 'guest', SMALL_NUMBER_OF_GUESTS);
    await meetingRoomPage.peopleButton.click();
    await expect(await meetingRoomPage.getNumberOfParticipantsInMeeting()).toBe(SMALL_NUMBER_OF_GUESTS + 1);

    // open grid view options besides the meeting room name & choose full screen view
    await expect(await viewOptionsPage.isFullScreen()).toBeFalsy();
    await viewOptionsPage.displayViewOptionsMenu();
    await viewOptionsPage.selectFullScreenViewOption();
    await expect(await viewOptionsPage.isFullScreen()).toBeTruthy();

    // assert that nothing else is shown except for the meeting room options, plus they should fade out after 3 sec
    // click mouse somewhere to trigger toolbar to become visible again (toolbar might already have faded out bc time spent on assertions above)
    await meetingRoomPage.page.mouse.click(100, 100);
    await meetingRoomPage.page.waitForTimeout(1000); // wait for a little moment because toolbar fades in
    await expect(meetingRoomPage.toolBar.toolBarPanel).toBeVisible();
    await meetingRoomPage.page.waitForTimeout(4000);
    await expect(meetingRoomPage.toolBar.toolBarPanel).toBeHidden();

    // exit full screen mode
    await viewOptionsPage.closeFullScreenMode();
    await expect(await viewOptionsPage.isFullScreen()).toBeFalsy();
    // grid view is shown with 2 participant windows being centered and in the same size
    await expect(await viewOptionsPage.getNumberOfParticipantWindowsInGridView()).toBe(2);
    await expect(await viewOptionsPage.getGridViewNthParticipantWindowSize(1)).toBe(
      await viewOptionsPage.getGridViewNthParticipantWindowSize(2)
    );
  });

  test('TC_004_VideoRoom_ParticipantViewSettings_List_GridView', async ({ page, context, browserName }) => {
    const { meetingRoomPage, guestLink } = await startAdhocMeetingAsModerator(page, browserName);
    viewOptionsPage = new ViewOptionsPage({ page: meetingRoomPage.page });

    // join with 5 guests (in separate browser instances)
    await joinMeetingRoomWithNGuests(meetingRoomPage, context, guestLink, 'guest', NUMBER_OF_GUESTS);
    await expect(await meetingRoomPage.getNumberOfParticipantsInMeeting()).toBe(NUMBER_OF_GUESTS + 1);

    // open grid view options besides the meeting room name
    await viewOptionsPage.displayViewOptionsMenu();
    await viewOptionsPage.selectGridViewOption(); // optional since grid view is activated by default
    // tik is activated
    await expect(await viewOptionsPage.hasTickIcon(viewOptionsPage.gridViewOption)).toBeTruthy();

    // all 5 participant windows are centered
    for (let i = 1; i <= NUMBER_OF_GUESTS; i++) {
      await expect(await viewOptionsPage.getGridViewNthParticipantWindowAlignment(i)).toBe('center');
    }
    // all 5 participant windows have same size
    const firstParticipantWindowSize = await viewOptionsPage.getGridViewNthParticipantWindowSize(1);
    for (let i = 2; i <= NUMBER_OF_GUESTS; i++) {
      await expect(firstParticipantWindowSize).toBe(await viewOptionsPage.getGridViewNthParticipantWindowSize(i));
    }
  });

  test.skip('TC_005_VideoRoom_ParticipantViewSettings_List_Sorting', async ({ page, context, browserName }) => {
    test.skip(browserName === 'webkit');
    test.skip(browserName === 'firefox');
    // in firefox one needs to give permission to turn camera on therefore skip firefox until solution for this is found

    const { meetingRoomPage, guestLink } = await startAdhocMeetingAsModerator(page, browserName);
    const firstJoinedParticipantName = await meetingRoomPage.getUserName();
    viewOptionsPage = new ViewOptionsPage({ page: meetingRoomPage.page });

    // join with 5 guests (in separate browser instances)
    const guestPages = await joinMeetingRoomWithNGuests(meetingRoomPage, context, guestLink, 'guest', NUMBER_OF_GUESTS);
    await expect(await meetingRoomPage.getNumberOfParticipantsInMeeting()).toBe(NUMBER_OF_GUESTS + 1);
    const firstGuestMeetingRoomPage = guestPages[0];
    const secondGuestMeetingRoomPage = guestPages[1];

    const firstGuestViewOptionsPage = new ViewOptionsPage({ page: firstGuestMeetingRoomPage.page });
    const secondGuestViewOptionsPage = new ViewOptionsPage({ page: secondGuestMeetingRoomPage.page });

    // work around for differences in grid view options between test server and local setup
    viewOptionsPage.allocateViewOptionLocatorsBasedOnSetup();
    secondGuestViewOptionsPage.allocateViewOptionLocatorsBasedOnSetup();

    // turn on the camera of one guest & assert video from the guest is shown
    await expect(await meetingRoomPage.isCameraOn()).toBeFalsy();
    await expect(await firstGuestMeetingRoomPage.isCameraOn()).toBeFalsy();
    await expect(await secondGuestMeetingRoomPage.isCameraOn()).toBeFalsy();
    await firstGuestMeetingRoomPage.turnCameraOn();
    await expect(await firstGuestMeetingRoomPage.isCameraOn()).toBeTruthy();

    // as moderator, open grid view options besides the meeting room name & select activated camera first
    await viewOptionsPage.displayViewOptionsMenu();
    await expect(await viewOptionsPage.hasTickIcon(viewOptionsPage.activatedCameraFirstSortingOption)).toBeFalsy();
    await viewOptionsPage.selectActivatedCameraFirstSortingOption();
    await expect(await viewOptionsPage.hasTickIcon(viewOptionsPage.activatedCameraFirstSortingOption)).toBeTruthy();

    // assert that guest user with the activated camera is on the first position on the left side
    await expect(await viewOptionsPage.isGridViewNthParticipantCameraOn(1)).toBeTruthy();
    // and for all other participants camera is not activated
    for (let i = 2; i <= NUMBER_OF_GUESTS; i++) {
      await expect(await viewOptionsPage.isGridViewNthParticipantCameraOn(i)).toBeFalsy();
    }

    // as guest, open grid view options besides the meeting room name & select moderators first
    // test on second guest because moderator would be shown by default in first position for the first guest
    await secondGuestViewOptionsPage.displayViewOptionsMenu();
    await expect(
      await secondGuestViewOptionsPage.hasTickIcon(secondGuestViewOptionsPage.moderatorsFirstSortingOption)
    ).toBeFalsy();
    await secondGuestViewOptionsPage.selectModertorsFirstSortingOption();
    await expect(
      await secondGuestViewOptionsPage.hasTickIcon(secondGuestViewOptionsPage.moderatorsFirstSortingOption)
    ).toBeTruthy();

    // assert that the moderator is now on the first position
    const moderatorName = await meetingRoomPage.getUserName();
    const moderatorFirstViewFirstPositionName = await secondGuestViewOptionsPage.getNthParticipantNameInGridView(1);
    await expect(moderatorFirstViewFirstPositionName).toBe(moderatorName);

    // as moderator, change to speaker view & assert that sorting resets after changing the view
    await viewOptionsPage.displayViewOptionsMenu();
    await expect(await viewOptionsPage.hasTickIcon(viewOptionsPage.speakerViewOption)).toBeFalsy();
    await viewOptionsPage.selectSpeakerViewOption();
    await expect(await viewOptionsPage.hasTickIcon(viewOptionsPage.speakerViewOption)).toBeTruthy();
    await expect(await viewOptionsPage.hasTickIcon(viewOptionsPage.gridViewOption)).toBeFalsy();
    await expect(await viewOptionsPage.hasTickIcon(viewOptionsPage.fullScreenViewOption)).toBeFalsy();
    await expect(await viewOptionsPage.hasTickIcon(viewOptionsPage.activatedCameraFirstSortingOption)).toBeFalsy();
    await expect(await viewOptionsPage.hasTickIcon(viewOptionsPage.moderatorsFirstSortingOption)).toBeFalsy();

    // assert active speaker is first shown
    await firstGuestMeetingRoomPage.turnAudioOn();
    const activeParticipantName = await firstGuestMeetingRoomPage.getUserName();
    const speakerViewFirstPositionName = await viewOptionsPage.getPinnedParticipantNameInSpeakerView();
    await expect(speakerViewFirstPositionName).toBe(activeParticipantName);

    /*
    // assert that without an active speaker, the moderator is shown
    // see https://git.opentalk.dev/opentalk/qa/reports/-/work_items/355#note_215290
    // assertion must be done on a guest page (though not first guest because first guest would not be visible on it's own page)
    // and view of guest page needs to be switched to speaker view
    await firstGuestMeetingRoomPage.turnCameraOff();
    await firstGuestMeetingRoomPage.turnAudioOff();
    await secondGuestMeetingRoomPage.displayViewOptionsMenu();
    await secondGuestMeetingRoomPage.selectSpeakerViewOption();
    await secondGuestMeetingRoomPage.page.waitForTimeout(10_000); // without timeout this seems to make CI fail
    const speakerViewNoActiveParticipantFirstPositionName =
      await secondGuestMeetingRoomPage.getPinnedParticipantNameInSpeakerView();
    await expect(speakerViewNoActiveParticipantFirstPositionName).toBe(moderatorName);
    await firstGuestMeetingRoomPage.turnCameraOn(); // reset camera
    */

    // change back to grid view
    await viewOptionsPage.displayViewOptionsMenu();
    await expect(await viewOptionsPage.hasTickIcon(viewOptionsPage.gridViewOption)).toBeFalsy();
    await viewOptionsPage.selectGridViewOption();
    await expect(await viewOptionsPage.hasTickIcon(viewOptionsPage.gridViewOption)).toBeTruthy();

    // as guest, assert order is set by default on first joined
    const gridViewFirstPositionName = await firstGuestViewOptionsPage.getNthParticipantNameInGridView(1);
    await expect(gridViewFirstPositionName).toBe(firstJoinedParticipantName);
  });
});
