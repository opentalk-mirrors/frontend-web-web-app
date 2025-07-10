// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Locator, Page } from '@playwright/test';

export class ViewOptionsPage {
  private readonly page: Page;

  public readonly viewOptionsButton: Locator;
  public readonly viewAndSortingPopupMenu: Locator;
  public readonly gridViewOption: Locator;
  public readonly speakerViewOption: Locator;
  public readonly fullScreenViewOption: Locator;
  public readonly fullScreenView: Locator;
  private readonly closeFullScreenButton: Locator;
  public activatedCameraFirstSortingOption: Locator;
  public moderatorsFirstSortingOption: Locator;
  private readonly gridViewContainer: Locator;
  public readonly gridViewParticipantWindow: Locator;
  private readonly speakerViewContainer: Locator;

  public readonly selectors = {
    viewPopoverMenu: '#view-popover-menu',
    viewPopoverMenuListItem: '#view-popover-menu > li',
    gridViewContainer: 'grid-container',
    speakerViewContainer: 'SpeakerView-Container',
    speakerViewParticipantsThumbsHolder: 'ThumbsHolder',
    speakerWindow: 'SpeakerWindow1',
    participantWindow: 'ParticipantWindow',
    participantName: 'nameTile',
    fullScreen: 'fullscreen',
  };

  public readonly videoPreviewName: Locator;

  constructor({ page }: { page: Page }) {
    this.page = page;

    this.viewOptionsButton = this.page.getByRole('button', { name: 'Select view' });
    this.viewAndSortingPopupMenu = this.page.locator(this.selectors.viewPopoverMenu);
    // get by role doesn't work for the menu items because the label is nested in a div and not part of the li element
    this.gridViewOption = this.page.locator(this.selectors.viewPopoverMenuListItem).nth(0);
    this.speakerViewOption = this.page.locator(this.selectors.viewPopoverMenuListItem).nth(1);
    this.fullScreenViewOption = this.page.locator(this.selectors.viewPopoverMenuListItem).nth(2);
    this.fullScreenView = this.page.getByTestId(this.selectors.fullScreen);
    this.closeFullScreenButton = this.page.getByTestId(this.selectors.fullScreen).getByLabel('close fullscreen');
    this.activatedCameraFirstSortingOption = this.page.locator(this.selectors.viewPopoverMenuListItem).nth(4);
    this.moderatorsFirstSortingOption = this.page.locator(this.selectors.viewPopoverMenuListItem).nth(5);
    this.gridViewContainer = this.page.getByTestId(this.selectors.gridViewContainer);
    this.gridViewParticipantWindow = this.page.getByTestId(this.selectors.participantWindow);
    this.speakerViewContainer = this.page.getByTestId(this.selectors.speakerViewContainer);

    this.videoPreviewName = this.page
      .getByRole('complementary', { name: 'Tools' })
      .getByTestId(this.selectors.participantName);
  }

  public allocateViewOptionLocatorsBasedOnSetup() {
    // correct differences between test server and local setup
    // constructor allocates locators to the UI version on test server, this function overwrites settings for local setup
    if (process.env.INSTANCE_URL.startsWith('http://')) {
      this.activatedCameraFirstSortingOption = this.page.locator(this.selectors.viewPopoverMenuListItem).nth(3);
      this.moderatorsFirstSortingOption = this.page.locator(this.selectors.viewPopoverMenuListItem).nth(4);
    }
  }

  public async displayViewOptionsMenu(): Promise<void> {
    await this.viewOptionsButton.waitFor();
    await this.viewOptionsButton.click();
    await this.viewAndSortingPopupMenu.waitFor();
    await this.viewAndSortingPopupMenu.isVisible();
  }

  public async selectGridViewOption(): Promise<void> {
    await this.gridViewOption.waitFor();
    await this.gridViewOption.click();
  }

  public async selectSpeakerViewOption(): Promise<void> {
    await this.speakerViewOption.waitFor();
    await this.speakerViewOption.click();
  }

  public async selectFullScreenViewOption(): Promise<void> {
    await this.fullScreenViewOption.waitFor();
    await this.fullScreenViewOption.click();
    await this.page.waitForLoadState();
    await this.page.waitForTimeout(1000); // it seems like there is some lag, without timeout this seems to make CI fail
    await this.fullScreenView.isVisible();
  }

  public async selectActivatedCameraFirstSortingOption(): Promise<void> {
    await this.activatedCameraFirstSortingOption.waitFor();
    await this.activatedCameraFirstSortingOption.click();
  }

  public async selectModertorsFirstSortingOption(): Promise<void> {
    await this.moderatorsFirstSortingOption.waitFor();
    await this.moderatorsFirstSortingOption.click();
  }

  public async hasTickIcon(element: Locator): Promise<boolean> {
    // if menu item has a tick, count should be 1, else 0
    return (await element.locator('div').first().locator('svg').count()) === 1;
  }

  public async isFullScreen(): Promise<boolean> {
    return await this.fullScreenView.isVisible();
  }

  public async closeFullScreenMode(): Promise<void> {
    await this.closeFullScreenButton.isVisible();
    await this.closeFullScreenButton.click();
    await this.closeFullScreenButton.isHidden();
    await this.fullScreenView.isHidden();
    await this.page.waitForTimeout(1000);
  }

  //functions (related to how participants are displayed)
  public async pinNthParticipantInSpeakerView(nth: number): Promise<string> {
    const participantsThumbs = await this.page.getByTestId(this.selectors.speakerViewParticipantsThumbsHolder);
    const nthParticipantWindow = await participantsThumbs.getByTestId(this.selectors.participantWindow).nth(nth - 1); // minus 1 because nth(0) is the first element
    await nthParticipantWindow.click();
    return await this.getNameTileText(nthParticipantWindow);
  }

  public async getPinnedParticipantNameInSpeakerView(): Promise<string> {
    const speakerWindow = await this.page
      .getByTestId(this.selectors.speakerWindow)
      .getByTestId(this.selectors.participantWindow);
    return await this.getNameTileText(speakerWindow);
  }

  public async getFirstParticipantNameInSpeakerView(): Promise<string> {
    const participantWindow = await this.page
      .getByTestId(this.selectors.speakerViewContainer)
      .getByTestId(this.selectors.participantWindow)
      .first();
    return await this.getNameTileText(participantWindow);
  }

  public async getThumbsNthParticipantNameInSpeakerView(nth: number): Promise<string> {
    const participantWindow = await this.page
      .getByTestId(this.selectors.speakerViewParticipantsThumbsHolder)
      .getByTestId(this.selectors.participantWindow)
      .nth(nth - 1); // minus 1 because nth(0) is the first element
    return await this.getNameTileText(participantWindow);
  }

  public async getNthParticipantNameInGridView(nth: number): Promise<string> {
    const participantWindow = await this.page
      //.getByTestId(this.selectors.gridViewContainer) // current version on CI doesn't have 'grid-container' test ID
      .getByTestId(this.selectors.participantWindow)
      .nth(nth - 1); // minus 1 because nth(0) is the first element
    return await this.getNameTileText(participantWindow);
  }

  public async getNumberOfParticipantWindowsInGridView(): Promise<number> {
    const participantWindows = await this.page
      //.getByTestId(this.selectors.gridViewContainer) // current version on CI doesn't have 'grid-container' test ID
      .getByTestId(this.selectors.participantWindow)
      .all();
    return participantWindows.length;
  }

  public async getNameTileText(participantWindow: Locator): Promise<string> {
    const nameTile = await participantWindow.getByTestId(this.selectors.participantName);
    let nameTileText = '';
    if (await nameTile.isVisible()) {
      nameTileText = await nameTile.innerText();
    }
    return nameTileText;
  }

  public async isGridViewNthParticipantCameraOn(nth: number): Promise<boolean> {
    const isGridViewParticipantCameraOn = await this.gridViewParticipantWindow
      .nth(nth - 1) // minus 1 because nth(0) is the first
      .locator('video');
    return await isGridViewParticipantCameraOn.isVisible();
  }

  public async getGridViewNthParticipantWindowAlignment(nth: number): Promise<string> {
    const gridViewParticipantWindowAlignment = await this.gridViewParticipantWindow
      .nth(nth - 1) // minus 1 because nth(0) is the first
      .evaluate((el) => {
        return window.getComputedStyle(el).getPropertyValue('align-items');
      });
    return gridViewParticipantWindowAlignment;
  }

  public async getGridViewNthParticipantWindowSize(nth: number): Promise<number> {
    const gridViewParticipantWindowSize = await this.gridViewParticipantWindow
      .nth(nth - 1) // minus 1 because nth(0) is the first
      .evaluate((el) => {
        return window.getComputedStyle(el).getPropertyValue('width'); // only evaluating width, same could be done with height
      });
    return Math.floor(+gridViewParticipantWindowSize);
  }
}
