/**
 * Wait for a specific amount of time
 * @param {number} ms - Time to wait in milliseconds
 * @returns {Promise<void>}
 */
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Wait for network idle
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {number} [timeout=5000] - Maximum time to wait in ms
 * @returns {Promise<void>}
 */
async function waitForNetworkIdle(page, timeout = 5000) {
  await Promise.race([
    page.waitForLoadState('networkidle'),
    wait(timeout).then(() => console.log('Network idle timeout')),
  ]);
}

/**
 * Take a screenshot of the current page
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} name - Name for the screenshot file
 * @returns {Promise<void>}
 */
async function takeScreenshot(page, name) {
  await page.screenshot({ path: `test-results/screenshots/${name}.png` });
}

/**
 * Get a random item from an array
 * @template T
 * @param {T[]} array - Array of items
 * @returns {T} Random item from the array
 */
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Check if an element is visible in the viewport
 * @param {import('@playwright/test').Locator} locator - Playwright locator
 * @returns {Promise<boolean>} Whether the element is visible
 */
async function isInViewport(locator) {
  const boundingBox = await locator.boundingBox();
  if (!boundingBox) return false;
  
  const viewport = await locator.page().viewportSize();
  if (!viewport) return false;
  
  return (
    boundingBox.x + boundingBox.width > 0 &&
    boundingBox.y + boundingBox.height > 0 &&
    boundingBox.x < viewport.width &&
    boundingBox.y < viewport.height
  );
}

module.exports = {
  wait,
  waitForNetworkIdle,
  takeScreenshot,
  getRandomItem,
  isInViewport,
};
