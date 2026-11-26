import {enterGame} from '../support/enterGame';
import { test,expect } from '@playwright/test';
test('manage department and preserve allocation after reload',async({page})=>{
  await enterGame(page);
  const section=page.getByRole('region',{name:'Corporate departments'});
  await expect(section).toBeVisible();
  await expect(section.getByTestId('department-budget')).toHaveText('£100');
  await section.getByRole('button',{name:'Increase budget £50'}).click();
  await expect(section.getByTestId('department-budget')).toHaveText('£150');
  await section.getByRole('button',{name:'Switch to operations'}).click();
  await expect(section.getByRole('button',{name:'Switch to governance'})).toBeDisabled();
  await page.reload();
  await expect(section.getByTestId('department-budget')).toHaveText('£150');
  await expect(section.getByRole('button',{name:'Switch to governance'})).toBeDisabled();
  await expect(section.getByText('Operations',{exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth)).toBe(false);
});
