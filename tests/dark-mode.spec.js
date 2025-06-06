const { test, expect } = require('@playwright/test');
const { waitForNetworkIdle } = require('./helpers');

// Test suite for dark mode functionality
test.describe('Dark Mode', () => {
  // Test case: Check if dark mode toggle exists and works
  test('should toggle dark mode', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
    
    // Wait for page to load
    await waitForNetworkIdle(page);
    
    // Check if dark mode toggle exists
    const darkModeToggle = page.locator('#dark-mode-toggle');
    await expect(darkModeToggle).toBeVisible();
    
    // Check initial state (should be light by default)
    const body = page.locator('body');
    const initialTheme = await body.evaluate(el => {
      return window.getComputedStyle(el).getPropertyValue('color-scheme');
    });
    
    // Toggle dark mode
    await darkModeToggle.click();
    await page.waitForTimeout(500); // Wait for transition
    
    // Check if theme changed
    const newTheme = await body.evaluate(el => {
      return window.getComputedStyle(el).getPropertyValue('color-scheme');
    });
    
    // Verify theme changed
    expect(newTheme).not.toBe(initialTheme);
    
    // Check localStorage for theme preference
    const themePreference = await page.evaluate(() => {
      return localStorage.getItem('theme-preference');
    });
    
    expect(themePreference).toBeDefined();
  });
  
  // Test case: Check if dark mode preference is saved
  test('should persist dark mode preference', async ({ page }) => {
    // Set dark mode in localStorage
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('theme-preference', 'dark');
    });
    
    // Reload the page
    await page.reload();
    await waitForNetworkIdle(page);
    
    // Check if dark mode is applied
    const body = page.locator('body');
    const theme = await body.evaluate(el => {
      return window.getComputedStyle(el).getPropertyValue('color-scheme');
    });
    
    // Verify dark mode is active
    expect(theme).toContain('dark');
  });
});
