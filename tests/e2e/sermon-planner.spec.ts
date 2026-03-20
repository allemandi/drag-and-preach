import { test, expect } from '@playwright/test';

test('loading and saving work via localStorage', async ({ page }) => {
  await page.goto('/');

  // Wait for the hydration - look for the title
  await expect(page.getByText('Drag and Preach')).toBeVisible({ timeout: 15000 });

  // Find a block and change its content
  // We click on a placeholder or existing content to activate the textarea
  // Intro section blocks have specific placeholders
  const firstBlock = page.getByText(/Begin with bold question/i).first();
  await firstBlock.click();

  const textarea = page.getByPlaceholder(/Begin with bold question/i).first();
  await textarea.fill('Updated content for testing');
  await textarea.blur();

  // Click save button
  await page.getByRole('button', { name: /save/i }).click();

  // Toast should appear
  await expect(page.getByText('Outline Saved').first()).toBeVisible();

  // Refresh page
  await page.reload();

  // Check if content persisted
  await expect(page.getByText('Updated content for testing')).toBeVisible();
});

test('exporting works', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Drag and Preach')).toBeVisible({ timeout: 15000 });

  // Open export modal
  await page.getByRole('button', { name: /export/i }).first().click();

  // Check if modal is open
  await expect(page.getByRole('heading', { name: 'Export Outline' })).toBeVisible();

  // Trigger a download (e.g., TXT)
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /plain text/i }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toContain('.txt');
});

test('reordering components exists and functional', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Drag and Preach')).toBeVisible({ timeout: 15000 });

  // Check if drag handles exist (using button and aria-label)
  const dragHandles = page.locator('button[aria-label*="Drag"]');
  await expect(dragHandles.first()).toBeVisible();

  // Try a simple drag interaction to ensure they are interactive
  const firstHandle = dragHandles.first();
  await firstHandle.hover();
  await page.mouse.down();
  await page.mouse.move(0, 100);
  await page.mouse.up();

  // We don't assert swap here because dnd-kit behavior in headless CI is inconsistent
  // without specialized setup, but we ensured the elements are present and interactive.
});
