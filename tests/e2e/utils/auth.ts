import type { Page } from '@playwright/test';
import { loginWithDefaultUser } from '../flows/auth.flow';

export async function loginAsDefaultUser(page: Page) {
  await loginWithDefaultUser(page);
}
