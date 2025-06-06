const { test, expect } = require('@playwright/test');

// Test suite for the portfolio page
test.describe('Portfolio Page', () => {
  // Test case: Check if the page loads successfully
  test('should load the portfolio page', async ({ page }) => {
    // Navigate to the portfolio page
    await page.goto('/portfolio');
    
    // Check if the page title is correct
    await expect(page).toHaveTitle(/Tom Sapletta/);
    
    // Check if the main content is visible
    await expect(page.locator('h1')).toContainText('Portfolio');
  });

  // Test case: Check if portfolio items are loaded
  test('should display portfolio items', async ({ page }) => {
    // Navigate to the portfolio page
    await page.goto('/portfolio');
    
    // Wait for portfolio items to load
    const portfolioItems = page.locator('.portfolio-item');
    await expect(portfolioItems).not.toHaveCount(0);
    
    // Check if at least one item has a title and description
    const firstItem = portfolioItems.first();
    await expect(firstItem.locator('h3')).not.toBeEmpty();
    await expect(firstItem.locator('p')).not.toBeEmpty();
  });

  // Test case: Test search functionality
  test('should filter items when searching', async ({ page }) => {
    // Navigate to the portfolio page
    await page.goto('/portfolio');
    
    // Get initial count of items
    const initialCount = await page.locator('.portfolio-item').count();
    
    // Type in search input
    await page.fill('#searchInput', 'react');
    
    // Wait for filtering to complete
    await page.waitForTimeout(500);
    
    // Get filtered count
    const filteredCount = await page.locator('.portfolio-item').count();
    
    // Check if filtering worked
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
    
    // Check if filtered items contain the search term
    const itemTitles = await page.locator('.portfolio-item h3').allTextContents();
    const itemDescriptions = await page.locator('.portfolio-item p').allTextContents();
    
    const allText = [...itemTitles, ...itemDescriptions].join(' ').toLowerCase();
    expect(allText).toContain('react');
  });

  // Test case: Test category filtering
  test('should filter items by category', async ({ page }) => {
    // Navigate to the portfolio page
    await page.goto('/portfolio');
    
    // Click on a category filter
    await page.click('button[data-filter="web"]');
    
    // Wait for filtering to complete
    await page.waitForTimeout(500);
    
    // Check if items have the correct category
    const items = await page.locator('.portfolio-item').all();
    for (const item of items) {
      const category = await item.getAttribute('data-category');
      expect(category).toBe('web');
    }
  });
});
