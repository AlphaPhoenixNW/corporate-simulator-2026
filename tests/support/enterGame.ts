import type {Page} from '@playwright/test';
import type {Workspace} from '../../src/ui/workspaces';
export async function enterGame(page:Page){
 await page.goto('/');
 await page.getByRole('button',{name:/^(Play now|Continue simulation)$/}).click();
}
export async function goWorkspace(page:Page,id:Workspace){
 const mobile=page.locator('#workspace-jump');
 const desktop=page.locator('a[data-route="'+id+'"]');
 const visible=await mobile.isVisible()?await mobile.locator('option[value="'+id+'"]').count()>0:await desktop.count()>0;
 if(!visible)await page.getByRole('button',{name:/^Show all workspaces/}).click();
 if(await mobile.isVisible())await mobile.selectOption(id);
 else await desktop.click();
}
export async function openSettings(page:Page){
 const settings=page.locator('details.workspace-settings');
 if(await settings.getAttribute('open')===null)await settings.locator('summary').first().click();
}
