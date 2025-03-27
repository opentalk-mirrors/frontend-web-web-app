// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test, expect } from '@playwright/test';

import { startAdhocMeetingAsModerator, joinMeetingRoomWithNGuests } from '../helper/meetingHelpers';

const NUMBER_OF_GUESTS = 5;
const SMALL_NUMBER_OF_GUESTS = 2;

test.describe('MeetingRoom - adjust participant view', () => {
  test('TC_001_VideoRoom_ParticipantViewSettings_List', async ({ page }) => {
    const { meetingRoomPage } = await startAdhocMeetingAsModerator(page);

    // work around for differences between test server and local setup
    meetingRoomPage.allocateViewOptionLocatorsBasedOnSetup();

    // when opening grid view options besides the meeting room name
    await meetingRoomPage.displayViewOptionsMenu();
    await expect(meetingRoomPage.viewOptions.viewAndSortingPopupMenu).toBeVisible();

    // assert grid view shows up with 3 options: Grid-View, Speaker-View, Fullscreen
    await expect(meetingRoomPage.viewOptions.gridViewOption).toBeVisible();
    await expect(await meetingRoomPage.viewOptions.gridViewOption.innerText()).toBe('Grid-View');
    await expect(meetingRoomPage.viewOptions.speakerViewOption).toBeVisible();
    await expect(await meetingRoomPage.viewOptions.speakerViewOption.innerText()).toBe('Speaker-View');
    await expect(meetingRoomPage.viewOptions.fullScreenViewOption).toBeVisible();
    await expect(await meetingRoomPage.viewOptions.fullScreenViewOption.innerText()).toBe('Fullscreen');
    // assert sorting shows up with 2 options: Activated camera first, Moderator(s) first
    await expect(meetingRoomPage.viewOptions.activatedCameraFirstSortingOption).toBeVisible();
    await expect(await meetingRoomPage.viewOptions.activatedCameraFirstSortingOption.innerText()).toBe(
      'Activated camera first'
    );
    await expect(meetingRoomPage.viewOptions.moderatorsFirstSortingOption).toBeVisible();
    await expect(await meetingRoomPage.viewOptions.moderatorsFirstSortingOption.innerText()).toBe('Moderator(s) first');
  });

  test('TC_002_VideoRoom_ParticipantViewSettings_List_SpeakerView', async ({ page, context, browserName }) => {
    test.skip(browserName === 'webkit');

    const { meetingRoomPage, guestLink } = await startAdhocMeetingAsModerator(page);

    // join with 5 guests (in separate browser instances)
    await joinMeetingRoomWithNGuests(meetingRoomPage, context, guestLink, 'guest', NUMBER_OF_GUESTS);
    await meetingRoomPage.selectPeopleTab();
    await expect(await meetingRoomPage.getNumberOfParticipantsInMeeting()).toBe(NUMBER_OF_GUESTS + 1);

    // open grid view options besides the meeting room name
    await meetingRoomPage.displayViewOptionsMenu();

    // choose speaker view
    // grid view should have a tick, but speaker view should have no tick before it is selected
    await expect(await meetingRoomPage.hasTickIcon(meetingRoomPage.viewOptions.gridViewOption)).toBeTruthy();
    await expect(await meetingRoomPage.hasTickIcon(meetingRoomPage.viewOptions.speakerViewOption)).toBeFalsy();
    await meetingRoomPage.selectSpeakerViewOption();
    await expect(await meetingRoomPage.hasTickIcon(meetingRoomPage.viewOptions.speakerViewOption)).toBeTruthy();

    // check the speaker view and pin some users
    const defaultPinnedParticipant = await meetingRoomPage.getPinnedParticipantNameInSpeakerView();
    // speaker is in first place
    await expect(await meetingRoomPage.getFirstParticipantNameInSpeakerView()).toBe(defaultPinnedParticipant);
    // pinned user is shown first among all participant thumbs
    await expect(await meetingRoomPage.getThumbsNthParticipantNameInSpeakerView(1)).toBe(defaultPinnedParticipant);
    // pin some user (3rd participant)
    const pinnedParticipant = await meetingRoomPage.pinNthParticipantInSpeakerView(3);
    await expect(defaultPinnedParticipant).not.toBe(pinnedParticipant);
    await expect(await meetingRoomPage.getPinnedParticipantNameInSpeakerView()).toBe(pinnedParticipant);
    // pin another user (2nd participant)
    const pinnedParticipant2 = await meetingRoomPage.pinNthParticipantInSpeakerView(2);
    await expect(await meetingRoomPage.getPinnedParticipantNameInSpeakerView()).toBe(pinnedParticipant2);
  });

  test('TC_003_VideoRoom_ParticipantViewSettings_List_FullScreen', async ({ page, context, browserName }) => {
    test.skip(browserName === 'webkit');

    const { meetingRoomPage, guestLink } = await startAdhocMeetingAsModerator(page);

    // join with 2 guests (in separate browser instances)
    await joinMeetingRoomWithNGuests(meetingRoomPage, context, guestLink, 'guest', SMALL_NUMBER_OF_GUESTS);
    await meetingRoomPage.peopleButton.click();
    await expect(await meetingRoomPage.getNumberOfParticipantsInMeeting()).toBe(SMALL_NUMBER_OF_GUESTS + 1);

    // open grid view options besides the meeting room name & choose full screen view
    await expect(await meetingRoomPage.isFullScreen()).toBeFalsy();
    await meetingRoomPage.displayViewOptionsMenu();
    await meetingRoomPage.selectFullScreenViewOption();
    await expect(await meetingRoomPage.isFullScreen()).toBeTruthy();

    // assert that nothing else is shown except for the meeting room options, plus they should fade out after 3 sec
    // click mouse somewhere to trigger toolbar to become visible again (toolbar might already have faded out bc time spent on assertions above)
    await meetingRoomPage.page.mouse.click(100, 100);
    await meetingRoomPage.page.waitForTimeout(1000); // wait for a little moment because toolbar fades in
    await expect(meetingRoomPage.toolBar.toolBarPanel).toBeVisible();
    await meetingRoomPage.page.waitForTimeout(4000);
    await expect(meetingRoomPage.toolBar.toolBarPanel).toBeHidden();

    // exit full screen mode
    await meetingRoomPage.closeFullScreenMode();
    await expect(await meetingRoomPage.isFullScreen()).toBeFalsy();
    // grid view is shown with 2 participant windows being centered and in the same size
    await expect(await meetingRoomPage.getNumberOfParticipantWindowsInGridView()).toBe(2);
    await expect(await meetingRoomPage.getGridViewNthParticipantWindowSize(1)).toBe(
      await meetingRoomPage.getGridViewNthParticipantWindowSize(2)
    );
  });

  test('TC_004_VideoRoom_ParticipantViewSettings_List_GridView', async ({ page, context, browserName }) => {
    test.skip(browserName === 'webkit');

    const { meetingRoomPage, guestLink } = await startAdhocMeetingAsModerator(page);

    // join with 5 guests (in separate browser instances)
    await joinMeetingRoomWithNGuests(meetingRoomPage, context, guestLink, 'guest', NUMBER_OF_GUESTS);
    await meetingRoomPage.selectPeopleTab();
    await expect(await meetingRoomPage.getNumberOfParticipantsInMeeting()).toBe(NUMBER_OF_GUESTS + 1);

    // open grid view options besides the meeting room name
    await meetingRoomPage.displayViewOptionsMenu();
    await meetingRoomPage.selectGridViewOption(); // optional since grid view is activated by default
    // tik is activated
    await expect(await meetingRoomPage.hasTickIcon(meetingRoomPage.viewOptions.gridViewOption)).toBeTruthy();

    // all 5 participant windows are centered
    for (let i = 1; i <= NUMBER_OF_GUESTS; i++) {
      await expect(await meetingRoomPage.getGridViewNthParticipantWindowAlignment(i)).toBe('center');
    }
    // all 5 participant windows have same size
    const firstParticipantWindowSize = await meetingRoomPage.getGridViewNthParticipantWindowSize(1);
    for (let i = 2; i <= NUMBER_OF_GUESTS; i++) {
      await expect(firstParticipantWindowSize).toBe(await meetingRoomPage.getGridViewNthParticipantWindowSize(i));
    }
  });

  test('TC_005_VideoRoom_ParticipantViewSettings_List_Sorting', async ({ page, context, browserName }) => {
    test.skip(browserName === 'webkit');
    test.skip(browserName === 'firefox');
    // in firefox one needs to give permission to turn camera on therefore skip firefox until solution for this is found

    const { meetingRoomPage, guestLink } = await startAdhocMeetingAsModerator(page);
    const firstJoinedParticipantName = await meetingRoomPage.getUserName();

    // join with 5 guests (in separate browser instances)
    const guestPages = await joinMeetingRoomWithNGuests(meetingRoomPage, context, guestLink, 'guest', NUMBER_OF_GUESTS);
    await meetingRoomPage.selectPeopleTab();
    await expect(await meetingRoomPage.getNumberOfParticipantsInMeeting()).toBe(NUMBER_OF_GUESTS + 1);
    const firstGuestMeetingRoomPage = guestPages[0];
    const secondGuestMeetingRoomPage = guestPages[1];

    // work around for differences in grid view options between test server and local setup
    meetingRoomPage.allocateViewOptionLocatorsBasedOnSetup();
    secondGuestMeetingRoomPage.allocateViewOptionLocatorsBasedOnSetup();

    // turn on the camera of one guest & assert video from the guest is shown
    await expect(await meetingRoomPage.isCameraOn()).toBeFalsy();
    await expect(await firstGuestMeetingRoomPage.isCameraOn()).toBeFalsy();
    await expect(await secondGuestMeetingRoomPage.isCameraOn()).toBeFalsy();
    await firstGuestMeetingRoomPage.turnCameraOn();
    await expect(await firstGuestMeetingRoomPage.isCameraOn()).toBeTruthy();

    // as moderator, open grid view options besides the meeting room name & select activated camera first
    await meetingRoomPage.displayViewOptionsMenu();
    await expect(
      await meetingRoomPage.hasTickIcon(meetingRoomPage.viewOptions.activatedCameraFirstSortingOption)
    ).toBeFalsy();
    await meetingRoomPage.selectActivatedCameraFirstSortingOption();
    await expect(
      await meetingRoomPage.hasTickIcon(meetingRoomPage.viewOptions.activatedCameraFirstSortingOption)
    ).toBeTruthy();

    // assert that guest user with the activated camera is on the first position on the left side
    await expect(await meetingRoomPage.isGridViewNthParticipantCameraOn(1)).toBeTruthy();
    // and for all other participants camera is not activated
    for (let i = 2; i <= NUMBER_OF_GUESTS; i++) {
      await expect(await meetingRoomPage.isGridViewNthParticipantCameraOn(i)).toBeFalsy();
    }

    // as guest, open grid view options besides the meeting room name & select moderators first
    // test on second guest because moderator would be shown by default in first position for the first guest
    await secondGuestMeetingRoomPage.displayViewOptionsMenu();
    await expect(
      await secondGuestMeetingRoomPage.hasTickIcon(secondGuestMeetingRoomPage.viewOptions.moderatorsFirstSortingOption)
    ).toBeFalsy();
    await secondGuestMeetingRoomPage.selectModertorsFirstSortingOption();
    await expect(
      await secondGuestMeetingRoomPage.hasTickIcon(secondGuestMeetingRoomPage.viewOptions.moderatorsFirstSortingOption)
    ).toBeTruthy();

    // assert that the moderator is now on the first position
    const moderatorName = await meetingRoomPage.getUserName();
    const moderatorFirstViewFirstPositionName = await secondGuestMeetingRoomPage.getNthParticipantNameInGridView(1);
    await expect(moderatorFirstViewFirstPositionName).toBe(moderatorName);

    // as moderator, change to speaker view & assert that sorting resets after changing the view
    await meetingRoomPage.displayViewOptionsMenu();
    await expect(await meetingRoomPage.hasTickIcon(meetingRoomPage.viewOptions.speakerViewOption)).toBeFalsy();
    await meetingRoomPage.selectSpeakerViewOption();
    await expect(await meetingRoomPage.hasTickIcon(meetingRoomPage.viewOptions.speakerViewOption)).toBeTruthy();
    await expect(await meetingRoomPage.hasTickIcon(meetingRoomPage.viewOptions.gridViewOption)).toBeFalsy();
    await expect(await meetingRoomPage.hasTickIcon(meetingRoomPage.viewOptions.fullScreenViewOption)).toBeFalsy();
    await expect(
      await meetingRoomPage.hasTickIcon(meetingRoomPage.viewOptions.activatedCameraFirstSortingOption)
    ).toBeFalsy();
    await expect(
      await meetingRoomPage.hasTickIcon(meetingRoomPage.viewOptions.moderatorsFirstSortingOption)
    ).toBeFalsy();

    // assert active speaker is first shown
    await firstGuestMeetingRoomPage.turnAudioOn();
    const activeParticipantName = await firstGuestMeetingRoomPage.getUserName();
    const speakerViewFirstPositionName = await meetingRoomPage.getPinnedParticipantNameInSpeakerView();
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
    await meetingRoomPage.displayViewOptionsMenu();
    await expect(await meetingRoomPage.hasTickIcon(meetingRoomPage.viewOptions.gridViewOption)).toBeFalsy();
    await meetingRoomPage.selectGridViewOption();
    await expect(await meetingRoomPage.hasTickIcon(meetingRoomPage.viewOptions.gridViewOption)).toBeTruthy();

    // as guest, assert order is set by default on first joined
    const gridViewFirstPositionName = await firstGuestMeetingRoomPage.getNthParticipantNameInGridView(1);
    await expect(gridViewFirstPositionName).toBe(firstJoinedParticipantName);
  });
});
