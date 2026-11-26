import {test,expect} from '@playwright/test';
test('promote an employee and retain grade after reload',async({page})=>{
  await page.goto('/');
  const section=page.getByRole('region',{name:'Personnel directory'});
  await expect(section.getByTestId('employee-count')).toHaveText('3');
  await section.getByRole('button',{name:/Competent Engineer/}).click();
  const profile=section.getByRole('article',{name:'Employee profile'});
  await expect(profile.getByTestId('employee-grade')).toHaveText('Individual contributor');
  await profile.getByRole('button',{name:/Promote/}).click();
  await expect(profile.getByTestId('employee-grade')).toHaveText('Manager');
  await page.reload();
  await section.getByRole('button',{name:/Competent Engineer/}).click();
  await expect(profile.getByTestId('employee-grade')).toHaveText('Manager');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth)).toBe(false);
});
