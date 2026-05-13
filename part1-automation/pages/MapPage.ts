import { Page, Locator } from '@playwright/test';

export class MapPage {
  readonly page: Page;
  readonly acceptAllCookiesButton: Locator;
  readonly startYourFreeTrialButton: Locator;
  readonly dismissFreeTrialPopupButton: Locator;
  readonly planOwnTripButton: Locator;
  readonly startLocationInput: Locator;
  readonly endLocationInput: Locator;
  readonly destinationError: Locator;
  readonly createTripButton: Locator;
  readonly tripTwoStopList: Locator;
  readonly tripThreeStopList: Locator;
  readonly addStopButton: Locator;
  readonly searchAlongRouteInput: Locator;
  readonly loginButton: Locator;
  readonly signOutButton: Locator;
  readonly launchTripButton: Locator;
  readonly waypointCountdownBanner: Locator;
  readonly waypointCountdownDismissButton: Locator;
  readonly startExploringDismissButton: Locator;
  readonly discoverCardButton: Locator;
  readonly removeWaypointButton: Locator;
  readonly removeConfirmButton: Locator;
  readonly addButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // Locators for the "Start a Trip" flow
    //this.startTripButton = page.getByRole('button', { name: 'Start Trip' });
    this.acceptAllCookiesButton = page.getByRole('button', { name: 'Accept All Cookies' });
    this.startYourFreeTrialButton = page.locator('iframe[title="Message"]').contentFrame().getByText('The first 7 days are on us.');
    this.dismissFreeTrialPopupButton = page.locator('iframe[title="Message"]').contentFrame().getByRole('button').first();
    this.planOwnTripButton = page.getByRole('radio', { name: 'Plan on your own Explore and' });
    this.startLocationInput = page.getByRole('textbox').first();
    this.endLocationInput = page.getByRole('textbox').nth(1);
    this.destinationError = page.getByText('Valid location required').nth(1);
    this.createTripButton = page.getByRole('button', { name: 'Go' });
    this.tripTwoStopList = page.getByText('1San Francisco, California, United States2Los Angeles, California, United States');
    this.tripThreeStopList = page.getByText('1San Francisco, California, United States2Salinas, CA3Los Angeles, California,');
    this.addStopButton = page.getByRole('textbox', { name: 'Add stops' });
    this.searchAlongRouteInput = page.getByPlaceholder('Search along route');
    this.loginButton = page.getByRole('link', { name: 'Log In', exact: true });
    this.signOutButton = page.getByRole('banner').getByRole('link', { name: 'Sign out' });
    this.launchTripButton = page.getByRole('button', { name: 'Launch trip' });
    this.waypointCountdownBanner = page.locator('.waypoint-countdown-banner');
    this.waypointCountdownDismissButton = page.locator('.waypoint-countdown-banner > .rt-button');
    this.startExploringDismissButton = page.locator('.rt-modal-close-button');
    this.discoverCardButton = page.locator('button.discover-card').first();
    this.removeWaypointButton = page.getByRole('button', { name: 'Remove Waypoint' });
    this.removeConfirmButton = page.getByRole('button', { name: 'Remove', exact: true });
    this.addButton = page.getByRole('button', { name: 'Add', exact: true });
  }

  async goto() {
    await this.page.goto('https://roadtrippers.com');
  }

  async login(username: string, password: string) {
    await this.loginButton.click();
    await this.page.getByRole('textbox', { name: 'Username or Email address' }).pressSequentially(username, { delay: 50 });
    await this.page.getByRole('textbox', { name: 'Password' }).pressSequentially(password, { delay: 50 } );
    await this.page.getByRole('button', { name: 'Log in' }).click();
  }

  async handlePopups() {

    const popupTimeoutt = 1000; // 1 seconds timeout for popups

    this.page.waitForLoadState('load').then(() => console.log('Page loaded, handling popups if any...'))
    // Try to handle Start Exploring popup
    await this.startExploringDismissButton.waitFor({ state: 'visible', timeout: popupTimeoutt })
        .then(() => this.startExploringDismissButton.click())
        .catch(() => console.log('Start Exploring popup did not appear.'));

    // Try to handle OneTrust cookie banner
    const cookieButton = this.page.locator('#onetrust-consent-sdk').getByRole('button', { name: 'Accept All Cookies' });
    await cookieButton.waitFor({ state: 'visible', timeout: popupTimeoutt })
        .then(() => cookieButton.click())
        .catch(() => console.log('Cookie banner not found.'));

    // Try to handle Gist trial popup iframe (using frameLocator which is safer)
    const frameCloseButton = this.page.frameLocator('iframe[title="Message"]').locator('button').first();
    await frameCloseButton.waitFor({ state: 'visible', timeout: popupTimeoutt })
        .then(() => frameCloseButton.click())
        .catch(() => console.log('Iframe popup not found.'));

    // Try legacy free trial text locator as fallback
    await this.startYourFreeTrialButton.waitFor({ state: 'visible', timeout: popupTimeoutt })
        .then(() => this.dismissFreeTrialPopupButton.click())
        .catch(() => console.log('Free trial popup not found.'));
  }

  async createTrip({ start, end }: { start: string; end: string; }) {
    await this.planOwnTripButton.click();

    if (start.length > 0) {
      await this.startLocationInput.click();
      await this.startLocationInput.fill('');
      await this.startLocationInput.pressSequentially(start, { delay: 100 });
      await this.page.waitForTimeout(2500);
      await this.page.keyboard.press('ArrowDown', { delay: 100 });
      await this.page.waitForTimeout(500);
      await this.page.keyboard.press('Enter', { delay: 100 });
      await this.page.waitForTimeout(500);
    }

    if (end.length > 0) {
      await this.endLocationInput.click();
      await this.endLocationInput.fill('');
      await this.endLocationInput.pressSequentially(end, { delay: 100 });
      await this.page.waitForTimeout(2500); 
      await this.page.keyboard.press('ArrowDown', { delay: 100 });
      await this.page.waitForTimeout(500);
      await this.page.keyboard.press('Enter', { delay: 100 });
      await this.page.waitForTimeout(500);
    }

    await this.createTripButton.click();
    //await this.page.waitForURL('**/trip/**', { timeout: 15000 });
  }

  async searchAndAddStop(poiName: string) {
    await this.addStopButton.click();
    await this.addStopButton.pressSequentially(poiName, { delay: 100 });
    await this.page.waitForTimeout(2500);
    if (await this.page.getByRole('listitem').first().isVisible({ timeout: 5000 }) && poiName.length > 0) {
      await this.page.keyboard.press('ArrowDown', { delay: 100 });
      await this.page.waitForTimeout(500);
      await this.page.keyboard.press('Enter', { delay: 100 });
      await this.page.waitForTimeout(500);
    }
  }


  // getWaypointByCity(cityName: string) {
  //   return this.page.locator('.waypoint-primary-label', { hasText: cityName }).first();
  // }

  // async verifyWaypoint(cityName: string) {
  //   await this.page.locator('.onboarding-waypoint-view').first().waitFor({ state: 'visible' });
  //   const waypoint = this.getWaypointByCity(cityName);
  //   await expect(waypoint).toBeVisible({ timeout: 10000 });
  // }

  getWaypointByCity(cityName: string) {
    return this.page.getByRole('button', { name: cityName }).first();
  }

  async removeWaypoint(cityName: string) {
    const waypointButton = this.getWaypointByCity(cityName);
    await waypointButton.click();
    await this.removeWaypointButton.click();
    await this.removeConfirmButton.click();
  }
  async clickMapPoi(poiName: string) {
    // Finds the map pin container or tooltip containing the POI name
    //const mapPin = this.page.getByRole('button', { name: poiName }).first();
    const mapPin = this.page.locator(`[aria-label*="${poiName}"]`).first();
    
    // Wait up to 10 seconds for map pins to render over the tiles
    await mapPin.waitFor({ state: 'visible', timeout: 10000 });
    await mapPin.click();
  }

}
