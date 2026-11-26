import {enterGame} from '../support/enterGame';
import {test,expect} from '@playwright/test';
test('draw corporate credit and acquire subscribers; retain financial state',async({page})=>{
  await enterGame(page);
  const section=page.getByRole('region',{name:'Corporate finance'});
  await section.getByRole('button',{name:'Draw £10,000 credit'}).click();
  await expect(section.getByTestId('finance-debt')).toHaveText('£10,000');
  await expect(page.getByTestId('cash')).toHaveText('£85,000');
  await section.getByRole('button',{name:/Acquire customers/}).click();
  await expect(section.getByTestId('finance-subscribers')).toHaveText('12');
  await page.reload();
  await expect(section.getByTestId('finance-debt')).toHaveText('£10,000');
  await expect(section.getByTestId('finance-subscribers')).toHaveText('12');
  await expect(section.getByRole('button',{name:'Draw £10,000 credit'})).toBeDisabled();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth)).toBe(false);
});
