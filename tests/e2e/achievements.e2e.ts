import {enterGame} from '../support/enterGame';
import {test,expect} from '@playwright/test';
test('earn an award, reload and retain lifetime recognition after replacing the simulation',async({page})=>{
 await enterGame(page);
 const panel=page.getByRole('region',{name:'Achievement framework'});
 await expect(panel.getByTestId('achievement-lifetime')).toHaveText('0/74');
 await page.getByRole('button',{name:/Practise bed-led leadership/}).click();
 await expect(panel.getByTestId('achievement-current')).toHaveText('1/74');
 await expect(panel.getByRole('complementary',{name:'Newly unlocked achievements'})).toContainText('Bed-Led Leadership');
 await page.reload();
 await expect(panel.getByTestId('achievement-lifetime')).toHaveText('1/74');
 await page.getByRole('button',{name:'New simulation',exact:true}).click();
 await page.getByRole('button',{name:'Replace save'}).click();
 await expect(panel.getByTestId('achievement-current')).toHaveText('0/74');
 await expect(panel.getByTestId('achievement-lifetime')).toHaveText('1/74');
 await panel.getByLabel('Award status').selectOption('earned');
 await expect(panel.getByRole('article',{name:'Bed-Led Leadership',exact:true})).toContainText('Lifetime award');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth)).toBe(false);
});
