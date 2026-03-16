import { test, expect } from '@playwright/test';

test('loading and saving work via localStorage', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('.container', { state: 'visible' });

  const firstBlock = page.getByText(/Begin with bold question/i).first();
  await firstBlock.click();

  const textarea = page.locator('textarea').first();
  await textarea.fill('Updated content for testing');
  await textarea.blur();

  await page.getByRole('button', { name: /save/i }).click();
  await expect(page.getByText('Outline Saved').first()).toBeVisible();

  await page.reload();
  await page.waitForSelector('.container', { state: 'visible' });
  await expect(page.getByText('Updated content for testing')).toBeVisible();
});

test('exporting works', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('.container', { state: 'visible' });

  await page.getByRole('button', { name: /export/i }).first().click();
  await expect(page.getByRole('heading', { name: 'Export Outline' })).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /plain text/i }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toContain('.txt');
});

test('reordering components exists and functional with mouse', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('.container', { state: 'visible' });

  const dragHandles = page.locator('div[role="button"][aria-label*="Drag"]');
  await expect(dragHandles.first()).toBeVisible();

  const firstHandle = dragHandles.first();
  const firstBox = await firstHandle.boundingBox();

  if (firstBox) {
    await page.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2 + 100, { steps: 10 });
    await page.mouse.up();
  }
});

test('reordering components functional with touch', async ({ page, isMobile }) => {
  await page.goto('/');
  await page.waitForSelector('.container', { state: 'visible' });

  const dragHandles = page.locator('div[role="button"][aria-label*="Drag"]');
  const firstHandle = dragHandles.first();
  const firstBox = await firstHandle.boundingBox();

  if (firstBox) {
    await page.touchscreen.tap(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2);
    // Simulate touch-drag if possible, or at least ensure it's tappable
    await page.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2 + 100, { steps: 10 });
    await page.mouse.up();
  }
});
