import { test, expect } from '@playwright/test';
import { MapPage } from '../pages/MapPage';

// Negative test: Try to create a trip without entering locations and verify the error message
test ('plan blank trip', async ({ page }) => {
  const mapPage = new MapPage(page);
  await mapPage.goto();
  await mapPage.handlePopups();
  await mapPage.createTrip({ start: '', end: '' });
  await expect(mapPage.destinationError).toBeVisible({ timeout: 5000 });
});

// Positive test: Create a trip from San Francisco to Los Angeles and verify the trip is created successfully
test ('plan a trip from SF to LA', async ({ context, page }) => {
  const mapPage = new MapPage(page);

  await mapPage.goto();
  await mapPage.handlePopups();

  const pagePromise = context.waitForEvent('page');

  await mapPage.createTrip({ start: 'San Francisco', end: 'Los Angeles' });

  const newTabPage = await pagePromise;

  const mapPageNewTab = new MapPage(newTabPage);
  
  await newTabPage.waitForLoadState();
  await mapPageNewTab.handlePopups();
  await mapPageNewTab.launchTripButton.click({ delay: 100});
  await mapPageNewTab.handlePopups();
  await mapPageNewTab.waypointCountdownBanner.waitFor({ state: 'visible', timeout: 10000 });
  await expect(mapPageNewTab.waypointCountdownBanner).toContainText('1 Free Waypoint Left');
  await expect(mapPageNewTab.discoverCardButton).toBeVisible({ timeout: 5000 });
});

// Edge test: Check the maximum number of stops allowed
test('check maximum number of stops', async ({ context, page }) => {
  const mapPage = new MapPage(page);
  await mapPage.goto();
  await mapPage.handlePopups();

  const pagePromise = context.waitForEvent('page');

  await mapPage.createTrip({ start: 'San Francisco', end: 'Los Angeles' });
  
  const newTabPage = await pagePromise;

  const mapPageNewTab = new MapPage(newTabPage);
  
  await newTabPage.waitForLoadState();
  await mapPageNewTab.handlePopups();
  await mapPageNewTab.searchAndAddStop('Salinas');
  await mapPageNewTab.launchTripButton.click({ delay: 100});
  await mapPageNewTab.handlePopups();
  await mapPageNewTab.waypointCountdownBanner.waitFor({ state: 'visible', timeout: 10000 });
  await expect(mapPageNewTab.waypointCountdownBanner).toContainText('No Free Waypoints Left');
  await expect(mapPageNewTab.discoverCardButton).not.toBeVisible({ timeout: 5000 });
});

// Positive test: Launch trip with three stops, add check that a stop can be edited and verify the change is saved successfully
test('launch trip with three stops and edit a stop', async ({ context, page }) => {
  const mapPage = new MapPage(page);
  await mapPage.goto();
  await mapPage.handlePopups();

  const pagePromise = context.waitForEvent('page');

  await mapPage.createTrip({ start: 'San Francisco', end: 'Los Angeles' });
  
  const newTabPage = await pagePromise;

  const mapPageNewTab = new MapPage(newTabPage);
  
  await newTabPage.waitForLoadState();
  await mapPageNewTab.handlePopups();
  await mapPageNewTab.searchAndAddStop('Salinas');
  await mapPageNewTab.launchTripButton.click({ delay: 100});
  await newTabPage.waitForLoadState();
  await mapPageNewTab.handlePopups();
  await mapPageNewTab.waypointCountdownBanner.waitFor({ state: 'visible', timeout: 10000 });
  await expect(mapPageNewTab.waypointCountdownBanner).toContainText('No Free Waypoints Left');
  await mapPageNewTab.removeWaypoint('Salinas');
  await mapPageNewTab.discoverCardButton.click({ delay: 100 });
  await mapPageNewTab.searchAndAddStop('General Sherman Tree');
  await expect(mapPageNewTab.discoverCardButton).not.toBeVisible({ timeout: 5000 });
});

// Positive test: Create a trip and add a stop from the map
test('create a trip and add a stop from the map', async ({ context, page }) => {
  const mapPage = new MapPage(page);
  await mapPage.goto();
  await mapPage.handlePopups();

  const pagePromise = context.waitForEvent('page');

  await mapPage.createTrip({ start: 'San Francisco', end: 'Los Angeles' });
  
  const newTabPage = await pagePromise;

  const mapPageNewTab = new MapPage(newTabPage);
  
  await newTabPage.waitForLoadState();
  await mapPageNewTab.handlePopups();
  await mapPageNewTab.launchTripButton.click({ delay: 100});
  //await newTabPage.waitForLoadState();
  await mapPageNewTab.handlePopups();
  await mapPageNewTab.clickMapPoi('Hearst Castle');
  await mapPageNewTab.addButton.click({ delay: 100 });
  await newTabPage.waitForLoadState();
  await expect(mapPageNewTab.discoverCardButton).not.toBeVisible({ timeout: 5000 });
});