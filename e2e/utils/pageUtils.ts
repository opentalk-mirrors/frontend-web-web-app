// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { BrowserContext, expect, Page } from '@playwright/test';

type ICreateMultiplePages = {
  context: BrowserContext;
  pageAmount: number;
};

type ICreateContextWithMultipleUsers = {
  context: BrowserContext;
  page: Page;
  userAmount: number;
};

/**
 * Creates multiple pages and returns them as an array, pageAmount must be a positive value
 *
 * @param {BrowserContext} context
 * @param {number} pageAmount
 * @return {Promise<Array<Page>>}
 */
const createMultiplePages = async ({ context, pageAmount }: ICreateMultiplePages) => {
  if (pageAmount < 0) {
    throw Error('pageAmount must be a positive number');
  }
  const pages: Array<Page> = [];
  for (let i = 0; i < pageAmount; i++) {
    pages.push(await context.newPage());
  }
  return pages;
};

/**
 * Join a conference with multiple users.
 *
 * ATTENTION: As of performance, keep the amount of users
 * as small as needed. This is not a function to do load tests, its just for testing
 * features for a handful users.
 *
 * @param {BrowserContext} context
 * @param {number} userAmount
 * @param {Page} page
 * @return {Promise<void>}
 */
export const createPageContextWithMultipleUsers = async ({
  context,
  userAmount,
  page,
}: ICreateContextWithMultipleUsers) => {
  if (userAmount < 0) {
    throw Error('userAmount must be a positive number');
  }
  const pages = await createMultiplePages({ context, pageAmount: userAmount });
  const roomURL = await createAdhocMeeting(page);

  let _userCounter = 0;
  for (const page of pages) {
    ++_userCounter;
    await gotoLobby(page, roomURL);
    await page.getByRole('button', { name: 'Enter now' }).click();
    await expect(page.getByTestId('toolbarEndCallButton')).toBeVisible();
  }
};

/**
 * Go to the dashboard
 *
 * @param {Page} page
 * @return {Promise<void>}
 */
export const gotoDashboard = async (page: Page) => {
  await page.goto(process.env.INSTANCE_URL);
};

/**
 * Go to the meeting lobby
 *
 * @param {Page} page
 * @param {roomURL} string
 * @return {Promise<void>}
 */
export const gotoLobby = async (page: Page, roomURL: string) => {
  await page.goto(roomURL);
  await page.waitForTimeout(1000);
};

/**
 * Go to the room
 *
 * @param {Page} page
 * @param {roomURL} string
 * @return {Promise<void>}
 */
export const gotoRoom = async (page: Page, roomURL: string) => {
  await gotoLobby(page, roomURL);
  await page.getByRole('button', { name: 'Enter now' }).click();
  await page.waitForTimeout(500);
};

/**
 * Creates an adhoc meeting
 *
 * Navigates to the dashboard and creates an adhocmeeting
 *
 * @param {Page} page
 * @return {Promise<string>} link to the adhoc meeting
 */
export const createAdhocMeeting = async (page: Page): Promise<string> => {
  await gotoDashboard(page);
  await page.getByRole('link', { name: 'Start new' }).click();
  return await page.getByLabel('Meeting-Link').inputValue();
};
