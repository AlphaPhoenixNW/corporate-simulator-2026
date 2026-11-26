import type {Page} from '@playwright/test';
export async function enterGame(page:Page){
 await page.goto('/');
 await page.getByRole('button',{name:/^(Play now|Continue simulation)$/}).click();
}
