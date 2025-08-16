const { test, expect } = require('@playwright/test');

// Test suite for the portfolio page
test.describe('Portfolio Page', () => {
  // Test case: Check if the page loads successfully
  test('should load the portfolio page', async ({ page }) => {
    // Navigate to the portfolio page
    const response = await page.goto('/portfolio');
    console.log('Page status:', response.status());
    
    // Check if the page title is correct
    await expect(page).toHaveTitle(/Tom Sapletta/);
    
    // Check if the main content is visible
    await expect(page.locator('h1')).toContainText('Portfolio');
    
    // Wait for portfolio grid to be visible
    await page.waitForSelector('.portfolio-grid', { state: 'visible', timeout: 10000 });
    
    // Check if loading indicator is hidden
    await expect(page.locator('#portfolio-loading')).toBeHidden();
    
    // Check if no error message is shown
    await expect(page.locator('#portfolio-error')).toBeHidden();
  });

  // Test case: Check if portfolio items are loaded
  test('should load and display portfolio items', async ({ page }) => {
    // Navigate to the portfolio page
    await page.goto('/portfolio');
    
    // Wait for loading to complete
    await page.waitForSelector('#portfolio-loading', { state: 'hidden', timeout: 15000 });
    
    // Wait for portfolio items to be visible
    const portfolioItems = page.locator('.portfolio-item');
    await expect(portfolioItems.first()).toBeVisible({ timeout: 10000 });
    
    // Get count of portfolio items
    const itemCount = await portfolioItems.count();
    console.log(`Found ${itemCount} portfolio items`);
    expect(itemCount).toBeGreaterThan(0);
    
    // Check if at least one item has a title, description, and tags
    const firstItem = portfolioItems.first();
    const title = firstItem.locator('.portfolio-content h3');
    const description = firstItem.locator('.portfolio-content p');
    const tags = firstItem.locator('.portfolio-tags .tag');
    
    await expect(title).not.toBeEmpty();
    await expect(description).not.toBeEmpty();
    expect(await tags.count()).toBeGreaterThan(0);
    
    console.log('First item title:', await title.textContent());
  });

  // Test case: Test search functionality
  test('should filter items when searching', async ({ page }) => {
    // Navigate to the portfolio page
    await page.goto('/portfolio');
    
    // Wait for initial load
    await page.waitForSelector('.portfolio-item', { state: 'visible', timeout: 10000 });
    
    // Get initial count of items
    const initialCount = await page.locator('.portfolio-item').count();
    expect(initialCount).toBeGreaterThan(0);
    
    // Type in search input
    const searchTerm = 'react';
    await page.fill('#searchInput', searchTerm);
    
    // Wait for filtering to complete (debounce time + rendering)
    await page.waitForTimeout(1000);
    
    // Check if items were filtered
    const filteredCount = await page.locator('.portfolio-item:visible').count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
    
    if (filteredCount > 0) {
      // Check if filtered items contain the search term
      const itemContents = await page.locator('.portfolio-item:visible').allTextContents();
      const allText = itemContents.join(' ').toLowerCase();
      expect(allText).toContain(searchTerm);
    } else {
      // Check if "no results" message is shown
      await expect(page.locator('.no-results')).toBeVisible();
    }
    
    // Test clearing the search
    await page.fill('#searchInput', '');
    await page.waitForTimeout(500);
    const restoredCount = await page.locator('.portfolio-item:visible').count();
    expect(restoredCount).toBe(initialCount);
  });

  // Test case: Test category filtering
  test('should filter items by category', async ({ page }) => {
    // Navigate to the portfolio page
    await page.goto('/portfolio');
    
    // Wait for initial load
    await page.waitForSelector('.portfolio-item', { state: 'visible', timeout: 10000 });
    
    // Get all category buttons
    const categoryButtons = page.locator('.filter-btn:not([data-filter="all"])');
    const categoryCount = await categoryButtons.count();
    
    if (categoryCount > 0) {
      // Test each category button
      for (let i = 0; i < Math.min(3, categoryCount); i++) { // Test first 3 categories to save time
        const button = categoryButtons.nth(i);
        const category = await button.getAttribute('data-filter');
        console.log(`Testing category: ${category}`);
        
        // Click the category button
        await button.click();
        await page.waitForTimeout(800); // Wait for filter animation
        
        // Get visible items
        const visibleItems = page.locator('.portfolio-item:visible');
        const visibleCount = await visibleItems.count();
        
        if (visibleCount > 0) {
          // Check if items have the correct category
          for (let j = 0; j < Math.min(3, visibleCount); j++) { // Check first 3 items
            const item = visibleItems.nth(j);
            const itemCategories = await item.getAttribute('data-categories');
            expect(itemCategories).toContain(category);
          }
        }
        
        // Click "All" button to reset
        await page.click('.filter-btn[data-filter="all"]');
        await page.waitForTimeout(300);
      }
    } else {
      console.log('No category filters found');
    }
  });
  
  // Test case: Check for error handling
  test('should handle loading errors gracefully', async ({ page }) => {
    // Mock a failed API request
    await page.route('**/portfolio/*.json', route => route.abort('failed'));
    
    // Navigate to the portfolio page
    await page.goto('/portfolio');
    
    // Check if error message is shown
    await expect(page.locator('#portfolio-error')).toBeVisible({ timeout: 10000 });
    
    // Check if error message contains expected text
    const errorText = await page.locator('#portfolio-error').textContent();
    expect(errorText).toMatch(/error|failed/i);
    
    // Check if loading indicator is hidden
    await expect(page.locator('#portfolio-loading')).toBeHidden();
  });
  
  // Test case: Check portfolio item interactions
  test('should allow interacting with portfolio items', async ({ page }) => {
    // Navigate to the portfolio page
    await page.goto('/portfolio');
    
    // Wait for items to load
    await page.waitForSelector('.portfolio-item', { state: 'visible', timeout: 10000 });
    
    // Hover over first item and check for hover effects
    const firstItem = page.locator('.portfolio-item').first();
    await firstItem.hover();
    await page.waitForTimeout(500);
    
    // Check if links in the item are clickable
    const links = firstItem.locator('a');
    const linkCount = await links.count();
    
    if (linkCount > 0) {
      // Test first link (usually the main project link)
      const firstLink = links.first();
      const href = await firstLink.getAttribute('href');
      
      if (href && !href.startsWith('#')) {
        // Open link in new tab and check it loads
        const [newPage] = await Promise.all([
          page.waitForEvent('popup'),
          firstLink.click({ button: 'middle' }) // Middle click to open in new tab
        ]);
        
        await newPage.waitForLoadState('networkidle');
        expect(newPage.url()).not.toBe(page.url());
        await newPage.close();
      }
    }
  });
});
