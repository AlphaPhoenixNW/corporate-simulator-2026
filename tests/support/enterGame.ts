import type {Page} from '@playwright/test';
import type {Workspace} from '../../src/ui/workspaces';
export async function enterGame(page:Page){
 await page.goto('/');
 await page.getByRole('button',{name:/^(Play now|Continue simulation)$/}).click();
}
export async function goWorkspace(page:Page,id:Workspace){
 const mobile=page.locator('#workspace-jump');
 if(await mobile.isVisible())await mobile.selectOption(id);
 else await page.locator('a[data-route="'+id+'"]').click();
}
export async function openSettings(page:Page){
 const settings=page.locator('details.workspace-settings');
 if(await settings.getAttribute('open')===null)await settings.locator('summary').first().click();
}
