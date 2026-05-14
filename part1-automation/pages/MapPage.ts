import { Page, Locator } from '@playwright/test';

export class MapPage {
  readonly page: Page;
  readonly startYourFreeTrialButton: Locator;
  readonly dismissFreeTrialPopupButton: Locator;
  readonly planOwnTripButton: Locator;
  readonly startLocationInput: Locator;
  readonly endLocationInput: Locator;
  readonly destinationError: Locator;
  readonly createTripButton: Locator;
  readonly addStopButton: Locator;
  readonly launchTripButton: Locator;
  readonly waypointCountdownBanner: Locator;
  readonly startExploringDismissButton: Locator;
  readonly discoverCardButton: Locator;
  readonly removeWaypointButton: Locator;
  readonly removeConfirmButton: Locator;
  readonly routingOptionsButton: Locator;
  readonly alterRouteButton: Locator;
  readonly makeRoundTripButton: Locator;
  readonly viewTripButton: Locator;
  readonly routingTripCloseButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.startYourFreeTrialButton = page.locator('iframe[title="Message"]').contentFrame().getByText('The first 7 days are on us.');
    this.dismissFreeTrialPopupButton = page.locator('iframe[title="Message"]').contentFrame().getByRole('button').first();
    this.planOwnTripButton = page.getByRole('radio', { name: 'Plan on your own Explore and' });
    this.startLocationInput = page.getByRole('textbox').first();
    this.endLocationInput = page.getByRole('textbox').nth(1);
    this.destinationError = page.getByText('Valid location required').nth(1);
    this.createTripButton = page.getByRole('button', { name: 'Go' });
    this.addStopButton = page.getByRole('textbox', { name: 'Add stops' });
    this.launchTripButton = page.getByRole('button', { name: 'Launch trip' });
    this.waypointCountdownBanner = page.locator('.waypoint-countdown-banner');
    this.startExploringDismissButton = page.locator('.rt-modal-close-button');
    this.discoverCardButton = page.locator('button.discover-card').first();
    this.removeWaypointButton = page.getByRole('button', { name: 'Remove Waypoint' });
    this.removeConfirmButton = page.getByRole('button', { name: 'Remove', exact: true });
    this.routingOptionsButton = page.getByRole('button', { name: 'Routing options', exact: true });
    this.alterRouteButton = page.getByRole('button', { name: 'Alter route', exact: true });
    this.makeRoundTripButton = page.getByRole('button', { name: 'Make Round Trip', exact: true }).last();
    this.viewTripButton = page.getByRole('button', { name: 'View Trip', exact: true });
    this.routingTripCloseButton = page.locator('button.rt-modal-close-button');
  }

  async goto() {
    await this.page.goto('https://roadtrippers.com');
  }

  async handlePopups() {

    const popupTimeout = 1500; // 1.2 seconds timeout for popups

    //this.page.waitForLoadState().then(() => console.log('Page loaded, handling popups if any...'))
    await this.page.waitForLoadState('load').then(() => console.log('Page loaded, handling popups if any...'));
    await this.page.waitForTimeout(5000); // Wait a moment for any popups to appear

    // Try legacy free trial text locator as fallback
    await this.startYourFreeTrialButton.waitFor({ state: 'visible', timeout: popupTimeout })
        .then(() => this.dismissFreeTrialPopupButton.click())
        .catch(() => console.log('Free trial popup not found.'));

    // Try to handle OneTrust cookie banner
    const cookieButton = this.page.locator('#onetrust-consent-sdk').getByRole('button', { name: 'Accept All Cookies' });
    await cookieButton.waitFor({ state: 'visible', timeout: popupTimeout })
        .then(() => cookieButton.click())
        .catch(() => console.log('Cookie banner not found.'));

    // Try to handle Gist trial popup iframe (using frameLocator which is safer)
    const frameCloseButton = this.page.frameLocator('iframe[title="Message"]').locator('button').first();
    await frameCloseButton.waitFor({ state: 'visible', timeout: popupTimeout })
        .then(() => frameCloseButton.click())
        .catch(() => console.log('Iframe popup not found.'));

    // Try to handle Start Exploring popup
    await this.startExploringDismissButton.waitFor({ state: 'visible', timeout: popupTimeout  })
        .then(() => this.startExploringDismissButton.click())
        .catch(() => console.log('Start Exploring popup did not appear.'));

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

  getWaypointByCity(cityName: string) {
    return this.page.getByRole('button', { name: cityName }).first();
  }

  async removeWaypoint(cityName: string) {
    const waypointButton = this.getWaypointByCity(cityName);
    await waypointButton.click();
    await this.removeWaypointButton.click();
    await this.removeConfirmButton.click();
  }

  async getWaypointNumberByCity(cityName: string, position: number): Promise<string | null> {
    const waypointCard = this.page.locator('.itinerary-waypoint-view', { hasText: cityName }).nth(position-1);
    const markerLabel = waypointCard.locator('.rt-waypoint-marker-label');
    
    return await markerLabel.textContent();
  }

}
