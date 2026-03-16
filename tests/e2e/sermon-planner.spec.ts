import { test, expect } from '@playwright/test';

test.describe('Sermon Outline Planner - E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to be mounted and visible (Next.js client-side hydration)
    await page.waitForSelector('.container', { state: 'visible' });
  });

  test('should load the initial sections', async ({ page }) => {
    await expect(page.getByText('Introduction')).toBeVisible();
    await expect(page.getByText('Body Section 1')).toBeVisible();
    await expect(page.getByText('Conclusion')).toBeVisible();
  });

  test('should save and load from local storage', async ({ page }) => {
    const testContent = 'This is a test content for the hook.';

    // Click the introduction hook section to start editing
    await page.get_by_text("Hook / Opening Question").first().click();

    const hookTextarea = page.locator('textarea');
    await hookTextarea.first().fill(testContent);

    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText('Outline Saved')).toBeVisible();

    await page.reload();
    await page.waitForSelector('.container', { state: 'visible' });

    await expect(page.getByText(testContent)).toBeVisible();
  });

  test('should export as TXT', async ({ page }) => {
    await page.getByRole('button', { name: 'Export' }).click();
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Plain Text (TXT)' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.txt');
  });

  test('should export as MD', async ({ page }) => {
    await page.getByRole('button', { name: 'Export' }).click();
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Markdown (MD)' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.md');
  });

  test('should reorder sections with drag and drop', async ({ page }) => {
    // Add a second body section
    await page.getByRole('button', { name: 'Add Body Section' }).click();
    await expect(page.getByText('Body Section 2', { exact: true })).toBeVisible();

    const grip1 = page.locator('div').filter({ hasText: /^Body Section 1$/ }).locator('button').first();
    const grip2 = page.locator('div').filter({ hasText: /^Body Section 2$/ }).locator('button').first();

    await grip1.dragTo(grip2);

    // Verify reordering - wait for state update
    await page.waitForTimeout(500);
    const sectionTitles = await page.locator('h3').allInnerTexts();
    const bodySectionTitles = sectionTitles.filter(t => t.startsWith('Body Section'));
    expect(bodySectionTitles[0]).toBe('Body Section 2');
  });

  test('should handle touch drag and drop on mobile', async ({ page, isMobile }) => {
    if (!isMobile) return;

    await page.getByRole('button', { name: 'Add Body Section' }).click();
    await expect(page.getByText('Body Section 2', { exact: true })).toBeVisible();

    const grip1 = page.locator('div').filter({ hasText: /^Body Section 1$/ }).locator('button').first();
    const grip2 = page.locator('div').filter({ hasText: /^Body Section 2$/ }).locator('button').first();

    const box1 = await grip1.boundingBox();
    const box2 = await grip2.boundingBox();

    if (box1 && box2) {
        // High-fidelity touch simulation
        await page.touchscreen.tap(box1.x + box1.width / 2, box1.y + box1.height / 2);
        // Dispatch touch events for drag
        await page.mouse.move(box1.x + box1.width / 2, box1.y + box1.height / 2);
        await page.mouse.down();
        await page.mouse.move(box2.x + box2.width / 2, box2.y + box2.height / 2, { steps: 10 });
        await page.mouse.up();
    }

    await page.waitForTimeout(500);
    const sectionTitles = await page.locator('h3').allInnerTexts();
    const bodySectionTitles = sectionTitles.filter(t => t.startsWith('Body Section'));
    expect(bodySectionTitles[0]).toBe('Body Section 2');
  });
});
